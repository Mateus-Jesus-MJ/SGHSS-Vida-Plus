import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumb());
  }

  private routeNames: { [key: string]: string } = {};

  private updateBreadcrumb() {
    this.breadcrumbs = [];
    let url = '';

    const segments = this.router.url.split('/').filter(segment => segment !== '');

    segments.forEach(segment => {
      url += `/${segment}`;
      this.breadcrumbs.push({
        label: this.routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        url
      });
    });
  }
}
