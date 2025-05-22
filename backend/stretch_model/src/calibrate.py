#!/usr/bin/env python3
import os
import glob
import argparse
import pandas as pd

def avg_landmarks(raw_dir, landmarks):
    """
    Read all CSVs in raw_dir, filter only landmark columns,
    and compute per-column average across frames and files.
    Returns a pandas Series indexed by column names (e.g., 'x0','y0','z0',..., 'z22').
    """
    files = glob.glob(os.path.join(raw_dir, '*.csv'))
    if not files:
        raise FileNotFoundError(f"No CSV files found in {raw_dir}")

    df_list = []
    cols = []
    for lm in landmarks:
        cols += [f'x{lm}', f'y{lm}', f'z{lm}']

    for fp in files:
        df = pd.read_csv(fp)
        df_list.append(df[cols])

    df_all = pd.concat(df_list, ignore_index=True)
    return df_all.mean()

def calibrate(neutral_dir, tpose_dir, landmarks):
    """
    Compute baseline averages for two calibration poses:
      1) neutral (natural standing/sitting)
      2) T-pose (arms spread horizontally)
    Returns:
      neutral_avg: Series of avg landmark coords
      tpose_avg: Series of avg landmark coords
      elbow_z_baseline: dict{'left_elbow_z_baseline', 'right_elbow_z_baseline'}
    """
    neutral_avg = avg_landmarks(neutral_dir, landmarks)
    tpose_avg   = avg_landmarks(tpose_dir, landmarks)

    # z-scale calibration using elbow z-values from T-pose
    elbow_z_baseline = {
        'left_elbow_z_baseline':  float(tpose_avg['z13']),
        'right_elbow_z_baseline': float(tpose_avg['z14']),
    }

    return neutral_avg, tpose_avg, elbow_z_baseline

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Calibration: compute landmark baselines')
    parser.add_argument('--neutral_dir', required=True,
                        help='Directory of CSVs for neutral pose calibration')
    parser.add_argument('--tpose_dir',   required=True,
                        help='Directory of CSVs for T-pose calibration')
    parser.add_argument('--output_prefix', default='calibration',
                        help='Prefix for output CSV files')
    args = parser.parse_args()

    # Landmark indices 0~22
    landmarks = list(range(23))

    neutral_avg, tpose_avg, elbow_z = calibrate(
        args.neutral_dir, args.tpose_dir, landmarks)

    # Save raw landmark baselines
    neutral_avg.to_csv(f'{args.output_prefix}_neutral_baseline.csv', header=True)
    tpose_avg.to_csv(f'{args.output_prefix}_tpose_baseline.csv', header=True)

    # Print elbow z baselines
    print('Elbow Z Baselines:')
    print(f"  left_elbow_z_baseline:  {elbow_z['left_elbow_z_baseline']}")
    print(f"  right_elbow_z_baseline: {elbow_z['right_elbow_z_baseline']}")
