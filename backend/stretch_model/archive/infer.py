import sys, os, pandas as pd, joblib
from utils import extract_features, load_config

MODEL_DIR   = 'models'
FEATURE_DIR = 'data/features'
CONFIG_DIR  = 'config'

def infer(exercise, feat_file):
    # 1) load model
    model = joblib.load(os.path.join(MODEL_DIR, f'{exercise}.pkl'))
    # 2) load config & features
    cfg   = load_config(os.path.join(CONFIG_DIR, f'{exercise}.yaml'))
    df    = pd.read_csv(os.path.join(FEATURE_DIR, feat_file))
    feat_df = extract_features(df, cfg['features'])
    # 3) summarize & predict
    X = pd.DataFrame({
        f'{c}_mean': [feat_df[c].mean()] for c in feat_df
    } | {
        f'{c}_std' : [feat_df[c].std()]  for c in feat_df
    })
    pred = model.predict(X)[0]
    print(f'{exercise} =>', '✅ OK' if pred==1 else '❌ NG')

if __name__ == '__main__':
    if len(sys.argv)!=3:
        print("Usage: python infer.py <exercise> <feature_csv>")
        sys.exit(1)
    infer(sys.argv[1], sys.argv[2])
