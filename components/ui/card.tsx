import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      'rounded-xl border border-border bg-card shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
