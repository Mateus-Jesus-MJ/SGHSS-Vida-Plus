export interface Menu {
  label: string;
  icon: string;
  submenus: Submenu[];
  funcionalidade?: string;
}

export interface Submenu {
  label: string;
  route?: string;
  action?: string;
  icon?: string;
  funcionalidade? :string
}

