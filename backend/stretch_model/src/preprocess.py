#!/usr/bin/env python3
import os
import glob
import argparse
import pandas as pd
import yaml
from utils import load_config, segment_reps, segment_holds, segment_reps_by_peaks, extract_features
from typing import Union, Dict, List, Tuple


def filter_landmarks(df, landmarks):
    """
    Keep only 'frame' and specified landmark columns
    """
    cols = ['frame']
    for lm in landmarks:
        cols += [f'x{lm}', f'y{lm}', f'z{lm}']
    return df[cols]


def process_exercise(df_filt, base, exercise, cfg, out_dir, fps):
    """
    Process exercise with all possible combinations of hold/rep and sides/direction.
    """
    # extract features
    feat_df = extract_features(
        df_filt,
        cfg['features'],
        calibration=cfg.get('calibration', {}),
        z_scale=cfg.get('z_scale', 1.0)
    )
    
    cycles_cfg = cfg.get('cycles', {})
    ctype = cycles_cfg.get('type', 'rep')
    
    # 방향 판단이 필요한 경우 (sides 또는 direction이 있는 경우)
    has_direction = 'direction' in cfg or 'sides' in cfg
    
    if has_direction:
        if ctype == 'hold':
            # hold + direction
            segments_by_direction = segment_holds(feat_df, cfg, fps)
            process_direction_segments(feat_df, segments_by_direction, base, exercise, out_dir, fps, ctype)
        else:
            # rep + direction
            arr = feat_df[cycles_cfg['feature']].values
            segments = segment_reps_by_peaks(arr, cycles_cfg, fps)
            process_direction_reps(feat_df, segments, base, exercise, out_dir, fps, cfg)
    else:
        if ctype == 'hold':
            # hold only
            segments = segment_holds(feat_df, cfg, fps)
            process_hold_segments(feat_df, segments, base, exercise, out_dir, fps)
        else:
            # rep only
            arr = feat_df[cycles_cfg['feature']].values
            segments = segment_reps_by_peaks(arr, cycles_cfg, fps)
            process_rep_segments(feat_df, segments, base, exercise, out_dir, fps, cfg)


def process_direction_segments(feat_df, segments_by_direction, base, exercise, out_dir, fps, ctype):
    """Process hold segments with direction detection."""
    summaries = []
    
    if isinstance(segments_by_direction, dict):
        # 방향별 세그먼트 처리
        for direction, segments in segments_by_direction.items():
            for idx, (s, e) in enumerate(segments, start=1):
                segment_df = feat_df.iloc[s:e].reset_index(drop=True)
                feat_name = f"{base}_{direction}_{ctype}{idx}_features.csv"
                segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
                print(f"  Saved: {exercise}/{feat_name}")
                
                summ = {
                    'segment': idx,
                    'direction': direction,
                    'duration': (e - s) / fps
                }
                summaries.append(summ)
    else:
        # 단일 방향 세그먼트 처리
        for idx, (s, e) in enumerate(segments_by_direction, start=1):
            segment_df = feat_df.iloc[s:e].reset_index(drop=True)
            feat_name = f"{base}_{ctype}{idx}_features.csv"
            segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
            print(f"  Saved: {exercise}/{feat_name}")
            
            summ = {
                'segment': idx,
                'direction': 'none',
                'duration': (e - s) / fps
            }
            summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_{ctype}_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def process_direction_reps(feat_df, segments, base, exercise, out_dir, fps, cfg):
    """Process rep segments with direction detection."""
    summaries = []
    for idx, (s, e) in enumerate(segments, start=1):
        segment_df = feat_df.iloc[s:e].reset_index(drop=True)
        
        # 방향 판단
        eye_diff = segment_df['eye_level_diff'].mean()
        shoulder_diff = segment_df['shoulder_level_diff'].mean()
        
        if eye_diff > 0 and shoulder_diff > 0:
            direction = 'left'
        elif eye_diff < 0 and shoulder_diff < 0:
            direction = 'right'
        else:
            direction = 'neutral'
        
        feat_name = f"{base}_{direction}_rep{idx}_features.csv"
        segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
        print(f"  Saved: {exercise}/{feat_name}")
        
        summ = {'segment': idx, 'direction': direction}
        for agg in cfg.get('aggregate', []):
            agg_name = agg['name']
            if agg['type'] == 'amplitude':
                vals = segment_df[agg['target_feature']]
                summ[agg_name] = vals.max() - vals.min()
            elif agg['type'] == 'duration':
                summ[agg_name] = (e - s) / fps
        summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_rep_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def process_hold_segments(feat_df, segments, base, exercise, out_dir, fps):
    """Process hold segments without direction."""
    summaries = []
    for idx, (s, e) in enumerate(segments, start=1):
        segment_df = feat_df.iloc[s:e].reset_index(drop=True)
        feat_name = f"{base}_hold{idx}_features.csv"
        segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
        print(f"  Saved: {exercise}/{feat_name}")
        
        summ = {
            'segment': idx,
            'duration': (e - s) / fps
        }
        summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_hold_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def process_rep_segments(feat_df, segments, base, exercise, out_dir, fps, cfg):
    """Process rep segments without direction."""
    summaries = []
    for idx, (s, e) in enumerate(segments, start=1):
        segment_df = feat_df.iloc[s:e].reset_index(drop=True)
        feat_name = f"{base}_rep{idx}_features.csv"
        segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
        print(f"  Saved: {exercise}/{feat_name}")
        
        summ = {'segment': idx}
        for agg in cfg.get('aggregate', []):
            agg_name = agg['name']
            if agg['type'] == 'amplitude':
                vals = segment_df[agg['target_feature']]
                summ[agg_name] = vals.max() - vals.min()
            elif agg['type'] == 'duration':
                summ[agg_name] = (e - s) / fps
        summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_rep_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--exercise', help='운동 이름 (생략 시 전체)')
    args = parser.parse_args()

    # load calibration
    calib_path = os.path.join('config', 'test_calibration.yaml')
    calibration = {}
    if os.path.exists(calib_path):
        with open(calib_path, encoding='utf-8') as f:
            calibration = yaml.safe_load(f).get('calibration', {})

    # list config files
    cfg_files = [p for p in glob.glob('config/*.yaml') if os.path.basename(p) != 'test_calibration.yaml']
    if args.exercise:
        cfg_files = [p for p in cfg_files if os.path.splitext(os.path.basename(p))[0] == args.exercise]

    for cfg_path in cfg_files:
        exercise = os.path.splitext(os.path.basename(cfg_path))[0]
        print(f"Processing exercise: {exercise}")
        cfg = load_config(cfg_path)
        cfg['calibration'] = calibration
        fps = cfg.get('fps', 30)
        raw_dir = os.path.join('data', 'processed', exercise)
        out_dir = os.path.join('data', 'features', exercise)
        os.makedirs(out_dir, exist_ok=True)

        for old_fp in glob.glob(os.path.join(out_dir, '*')):
            try:
                os.remove(old_fp)
            except OSError:
                pass

        for fp in glob.glob(os.path.join(raw_dir, '*.csv')):
            df_raw = pd.read_csv(fp)
            df_filt = filter_landmarks(df_raw, cfg['landmarks'])
            base = os.path.splitext(os.path.basename(fp))[0]
            process_exercise(df_filt, base, exercise, cfg, out_dir, fps)

if __name__ == '__main__':
    main()
