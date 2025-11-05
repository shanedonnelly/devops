declare module 'lucide-react' {
  // minimal types for lucide-react icons used in the project
  import * as React from 'react';
  type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };
  export const Plus: React.FC<IconProps>;
  export const Edit: React.FC<IconProps>;
  export const Trash2: React.FC<IconProps>;
  export const Package: React.FC<IconProps>;
  export const ArrowLeft: React.FC<IconProps>;
  export const Save: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const Store: React.FC<IconProps>;
  export const Palette: React.FC<IconProps>;
  export const MessageSquare: React.FC<IconProps>;
  export const Zap: React.FC<IconProps>;
  export const Globe: React.FC<IconProps>;
  export const BarChart3: React.FC<IconProps>;
  export const ExternalLink: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const LayoutDashboard: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const ShoppingCart: React.FC<IconProps>;
  export const Mail: React.FC<IconProps>;
  const lucide: { [key: string]: React.FC<IconProps> };
  export default lucide;
}
