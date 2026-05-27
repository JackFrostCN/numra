import * as React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface Props extends TextProps {
  className?: string;
}

const Text = React.forwardRef<RNText, Props>(
  ({ className, style, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        className={cn('text-foreground', className)}
        style={style}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

export { Text };
