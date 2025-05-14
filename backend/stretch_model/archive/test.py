import pandas as pd
a = pd.read_csv('data/processed/가슴_T자_landmarks.csv')
b = pd.read_csv('data/processed/가슴_T자/가슴_T자_3_1_landmarks.csv')
assert a.equals(b), "두 CSV가 다릅니다!"
