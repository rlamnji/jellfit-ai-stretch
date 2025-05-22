import os, glob
import pandas as pd
import yaml, joblib
from sklearn.ensemble      import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics        import classification_report

LABEL_CSV   = 'data/labels.csv'
FEATURE_DIR = 'data/features'
MODEL_DIR   = 'models'

def load_label_map():
    df = pd.read_csv(LABEL_CSV)
    return dict(zip(df['filename'], df['label']))

def get_exercises():
    return [os.path.splitext(f)[0]
            for f in os.listdir('config')
            if f.endswith('.yaml')]

def load_features(ex, label_map):
    X, y = [], []
    pattern = f'{FEATURE_DIR}/{ex}_*_*_features.csv'
    for fp in glob.glob(pattern):
        df = pd.read_csv(fp)
        fname = os.path.basename(fp)
        lbl = df['label'].iloc[0] if 'label' in df else label_map.get(fname)
        data = df.drop(columns=['label'], errors='ignore')
        summary = {}
        for c in data.columns:
            summary[f'{c}_mean'] = data[c].mean()
            summary[f'{c}_std']  = data[c].std()
        X.append(summary); y.append(int(lbl))
    return pd.DataFrame(X), pd.Series(y)

def train_one(ex, label_map):
    X, y = load_features(ex, label_map)
    xt, xv, yt, yv = train_test_split(
        X, y, test_size=0.3, stratify=y, random_state=42
    )
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(xt, yt)
    print(f'\n--- {ex} ---')
    print(classification_report(yv, clf.predict(xv)))
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, f'{MODEL_DIR}/{ex}.pkl')

def main():
    lm = load_label_map()
    for ex in get_exercises():
        train_one(ex, lm)
    print("\n✅ All models trained.")

if __name__=='__main__':
    main()
