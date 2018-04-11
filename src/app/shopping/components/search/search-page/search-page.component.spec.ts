import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockComponent } from '../../../../utils/dev/mock.component';
import { SearchPageComponent } from './search-page.component';

describe('Search Page Component', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;
  let element: HTMLElement;
  let translate: TranslateService;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        declarations: [
          SearchPageComponent,
          MockComponent({
            selector: 'ish-product-list-toolbar',
            template: 'Products List Toolbar Component',
            inputs: ['itemCount', 'viewType', 'sortBy', 'sortKeys'],
          }),
          MockComponent({
            selector: 'ish-product-list',
            template: 'Products List Component',
            inputs: ['products', 'viewType'],
          }),
        ],
        providers: [TranslateService],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    translate = TestBed.get(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render headline with search term on template', () => {
    component.searchTerm = 'Test Search Term';
    component.totalItems = 111;
    translate.set('search.title.text', '{{1}} - {{2}}');
    // tslint:disable-next-line:no-any
    translate.set('search.title.items.text', { other: '#' } as any);
    fixture.detectChanges();
    expect(element.querySelector('[data-testing-id=search-result-page] h1')).toBeTruthy();
    expect(element.querySelector('[data-testing-id=search-result-page] h1').textContent).toContain(
      component.searchTerm
    );
    expect(element.querySelector('[data-testing-id=search-result-page] h1').textContent).toContain(
      component.totalItems.toString()
    );
  });
});
