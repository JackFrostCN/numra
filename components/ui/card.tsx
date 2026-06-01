import * as React from 'react';
import { View, Pressable, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Card = React.forwardRef<View, CardProps>(({ className, onPress, onLongPress, style, children, ...props }, ref) => {
  const content = (
    <View
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress}>
        {content}
      </Pressable>
    );
  }

  return content;
});
Card.displayName = 'Card';

export { Card };
