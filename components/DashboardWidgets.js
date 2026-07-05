import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
} from 'react-native-svg';

// --- Circular progress ring with gradient stroke, soft glow, and icon badge ---
export function RingCard({ id, label, value, unit, progress, colors, icon, size = 104, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const gradId = `grad-${id}`;
  const glowId = `glow-${id}`;

  return (
    <View style={styles.ringCardWrapper}>
      <LinearGradient
        colors={['#181F36', '#111729']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ringCard}
      >
        <View style={styles.ringCardTopRow}>
          <View style={[styles.iconBadge, { backgroundColor: `${colors[0]}22` }]}>
            <Ionicons name={icon} size={13} color={colors[0]} />
          </View>
          <Text style={styles.ringCardLabel}>{label.toUpperCase()}</Text>
        </View>

        <View style={{ width: size, height: size, alignSelf: 'center' }}>
          <Svg width={size} height={size}>
            <Defs>
              <SvgRadialGradient id={glowId} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={colors[0]} stopOpacity={0.28} />
                <Stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
              </SvgRadialGradient>
              <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="100%" stopColor={colors[1]} />
              </SvgLinearGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${glowId})`} />
            <Circle
              stroke="#242C46"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={`url(#${gradId})`}
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
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.miniBarFill, { width: `${clampedProgress}%` }]}
          />
        </View>
        <Text style={[styles.miniBarPercent, { color: colors[0] }]}>{Math.round(clampedProgress)}%</Text>
      </LinearGradient>
    </View>
  );
}

// --- Weekly activity chart with smooth curve and gradient fill ---
export function ActivityChart({ series }) {
  const width = 300;
  const height = 140;
  const padding = 20;

  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues) * 1.15;
  const minVal = 0;

  const pointsFor = (data) =>
    data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y };
    });

  // Smooth curve using quadratic bezier midpoints, instead of straight line segments
  const smoothPathFor = (points) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  };

  const areaPathFor = (points) => {
    const line = smoothPathFor(points);
    return `${line} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  };

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          {series.map((s, idx) => (
            <SvgLinearGradient key={idx} id={`chartFill-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </SvgLinearGradient>
          ))}
        </Defs>
        {series.map((s, idx) => {
          const points = pointsFor(s.data);
          return (
            <React.Fragment key={idx}>
              <Path d={areaPathFor(points)} fill={`url(#chartFill-${idx})`} />
              <Path d={smoothPathFor(points)} stroke={s.color} strokeWidth={2.75} fill="none" strokeLinecap="round" />
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

// --- Activity breakdown donut with center total ---
export function ActivityDonut({ segments, size = 140, strokeWidth = 20 }) {
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
          <Circle
            stroke="#1D2338"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
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
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ))}
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutTotal}>{total}</Text>
          <Text style={styles.donutTotalLabel}>sessions</Text>
        </View>
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
  ringCardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  ringCard: {
    borderRadius: 18,
    padding: 14,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ringCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  ringCardLabel: {
    color: '#8B93A7',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
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
    color: '#F5F7FA',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ringUnit: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 1,
  },
  miniBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#1D2338',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: 4,
    borderRadius: 2,
  },
  miniBarPercent: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
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
    marginTop: 12,
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
    color: '#8B93A7',
    fontSize: 12,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotal: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '800',
  },
  donutTotalLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 1,
  },
  donutLegend: {
    flex: 1,
    paddingLeft: 16,
  },
});