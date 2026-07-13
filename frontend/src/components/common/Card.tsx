import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'border-slate-800/60',
  danger: 'border-red-900/40 bg-red-950/10',
  success: 'border-emerald-900/40 bg-emerald-950/10',
  warning: 'border-amber-900/40 bg-amber-950/10',
  info: 'border-blue-900/40 bg-blue-950/10',
};

const glowStyles = {
  default: 'noc-glow-blue',
  danger: 'noc-glow-red',
  success: 'noc-glow-green',
  warning: 'noc-glow-amber',
  info: 'noc-glow-blue',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4 lg:p-5',
  lg: 'p-5 lg:p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  glow = false,
  padding = 'md',
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border bg-slate-900/80 backdrop-blur-sm shadow-2xl',
        variantStyles[variant],
        hover && 'transition-all duration-200 hover:bg-slate-800/80 hover:border-slate-700/60 cursor-pointer',
        glow && glowStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, action }) => {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-slate-800/60', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, icon }) => {
  return (
    <h3 className={cn('font-semibold text-slate-100 flex items-center gap-2', className)}>
      {icon}
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <p className={cn('text-sm text-slate-400 mt-1', className)}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('pt-4', className)}>{children}</div>;
};