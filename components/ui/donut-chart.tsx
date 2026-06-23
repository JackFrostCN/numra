import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { formatCurrency } from '@/utils/helpers';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface ChartData {
  category: string;
  amount: number;
  color: string;
}

interface DonutChartProps {
  data: ChartData[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ data, size = 200, strokeWidth = 35 }: DonutChartProps) {
  const colors = useThemeColors();
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [data]);

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // If no data, render an empty grey ring
  if (totalAmount === 0 || data.length === 0) {
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.bgElevated}
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={[styles.centerContent, { width: size, height: size }]}>
          <Text style={[styles.centerCount, { color: colors.textPrimary }]}>0</Text>
          <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>Expenses</Text>
        </View>
      </View>
    );
  }

  // Calculate paths
  let startAngle = 0;
  const arcs = data.map((item) => {
    const percentage = item.amount / totalAmount;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    // Convert angles to radians and calculate coordinates
    // We start at -90 degrees (top)
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // SVG path string
    // If the slice is exactly 100% (angle === 360), a single path command won't work well
    let d;
    if (percentage === 1) {
      d = `M ${center} ${center - radius} 
           a ${radius} ${radius} 0 1 0 0 ${radius * 2} 
           a ${radius} ${radius} 0 1 0 0 ${-radius * 2}`;
    } else {
      d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    }

    startAngle = endAngle;

    return {
      ...item,
      percentage,
      path: d,
      length: percentage === 1 ? 2 * Math.PI * radius : (angle / 360) * 2 * Math.PI * radius,
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Svg width={size} height={size} style={{ transform: [{ rotateZ: '0deg' }] }}>
          {arcs.map((arc, index) => {
            const animatedProps = useAnimatedProps(() => {
              return {
                strokeDashoffset: arc.length * (1 - animatedProgress.value),
              };
            });

            return (
              <AnimatedPath
                key={index}
                d={arc.path}
                stroke={arc.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={arc.length}
                animatedProps={animatedProps}
              />
            );
          })}
        </Svg>
        <View style={[styles.centerContent, { width: size, height: size }]}>
          <Text style={[styles.centerCount, { color: colors.textPrimary }]}>{data.length}</Text>
          <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>Expenses</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => {
          const perc = Math.round((item.amount / totalAmount) * 100);
          return (
            <View key={index} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.swatch, { backgroundColor: item.color }]} />
                <Text style={[styles.legendName, { color: colors.textPrimary }]}>{item.category}</Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>{formatCurrency(item.amount)}</Text>
                <Text style={[styles.legendPerc, { color: colors.textSecondary }]}>{perc}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCount: {
    fontSize: 28,
    fontFamily: Fonts.heading,
  },
  centerLabel: {
    fontSize: 12,
    fontFamily: Fonts.body,
    marginTop: 2,
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  legendName: {
    fontSize: 15,
    fontFamily: Fonts.body,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendAmount: {
    fontSize: 15,
    fontFamily: Fonts.mono,
    marginRight: Spacing.md,
  },
  legendPerc: {
    fontSize: 13,
    fontFamily: Fonts.body,
    width: 36,
    textAlign: 'right',
  },
});
