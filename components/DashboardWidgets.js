import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// --- Circular progress ring (Heart Rate, Calories, Steps, Distance style) ---
export function RingCard({ label, value, unit, progress, color, size = 100, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={styles.ringCard}>
      <Text style={styles.ringCardLabel}>{label.toUpperCase()}</Text>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#2A2D35"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{value}</Text>
          <Text style={styles.ringUnit}>{unit}</Text>
        </View>
      </View>
      <View style={styles.miniBarTrack}>
        <View style={[styles.miniBarFill, { width: `${clampedProgress}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.miniBarPercent, { color }]}>{Math.round(clampedProgress)}%</Text>
    </View>
  );
}

// --- Weekly activity line chart (mock trend data until historical tracking is built) ---
export function ActivityChart({ series }) {
  const width = 320;
  const height = 140;
  const padding = 20;

  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues) * 1.1;
  const minVal = 0;

  const pointsFor = (data) =>
    data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y };
    });

  const pathFor = (points) =>
    points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  const areaPathFor = (points) => {
    const line = pathFor(points);
    return `${line} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  };

  return (
    <View>
      <Svg width={width} height={height}>
        {series.map((s, idx) => {
          const points = pointsFor(s.data);
          return (
            <React.Fragment key={idx}>
              <Path d={areaPathFor(points)} fill={s.color} fillOpacity={0.12} />
              <Path d={pathFor(points)} stroke={s.color} strokeWidth={2.5} fill="none" />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.chartLabelsRow}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <Text key={d} style={styles.chartDayLabel}>{d}</Text>
        ))}
      </View>
      <View style={styles.legendRow}>
        {series.map((s, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- Activity breakdown donut (Running/Swimming/Cycling/Walking style) ---
export function ActivityDonut({ segments, size = 140, strokeWidth = 18 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulativeOffset = 0;
  const arcs = segments.map((s) => {
    const fraction = total > 0 ? s.value / total : 0;
    const dash = fraction * circumference;
    const arc = {
      color: s.color,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -cumulativeOffset,
    };
    cumulativeOffset += dash;
    return arc;
  });

  return (
    <View style={styles.donutRow}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {arcs.map((arc, idx) => (
            <Circle
              key={idx}
              stroke={arc.color}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.donutLegend}>
        {segments.map((s, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringCard: {
    width: '48%',
    backgroundColor: '#1A1D24',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  ringCardLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  ringUnit: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  miniBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#2A2D35',
    borderRadius: 2,
    marginTop: 10,
  },
  miniBarFill: {
    height: 4,
    borderRadius: 2,
  },
  miniBarPercent: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  chartDayLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutLegend: {
    flex: 1,
    paddingLeft: 16,
  },
});