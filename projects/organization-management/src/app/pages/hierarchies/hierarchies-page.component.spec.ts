import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { TreeviewComponent } from 'ngx-treeview';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { ErrorMessageComponent } from 'ish-shared/components/common/error-message/error-message.component';
import { LoadingComponent } from 'ish-shared/components/common/loading/loading.component';

import { OrganizationManagementFacade } from '../../facades/organization-management.facade';
import { Group, GroupTree } from '../../models/group/group.model';

import { HierarchiesPageComponent } from './hierarchies-page.component';

describe('Hierarchies Page Component', () => {
  let component: HierarchiesPageComponent;
  let fixture: ComponentFixture<HierarchiesPageComponent>;
  let element: HTMLElement;
  let organizationManagementFacade: OrganizationManagementFacade;

  const rootGroup = {
    id: 'root',
    name: 'ROOT',
    organization: 'acme.org',
  } as Group;
  const childGroup = {
    id: 'child',
    name: 'Child',
    organization: 'acme.org',
  } as Group;
  const groupTree = {
    edges: { root: ['child'] },
    groups: { root: rootGroup, child: childGroup },
    rootIds: ['root'],
  } as GroupTree;

  beforeEach(async () => {
    organizationManagementFacade = mock(OrganizationManagementFacade);
    when(organizationManagementFacade.groups$()).thenReturn(of(groupTree));
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [
        HierarchiesPageComponent,
        MockComponent(ErrorMessageComponent),
        MockComponent(LoadingComponent),
        MockComponent(TreeviewComponent),
      ],
      providers: [{ provide: OrganizationManagementFacade, useFactory: () => instance(organizationManagementFacade) }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchiesPageComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    translate.setTranslation('en', {
      'account.organization.hierarchies.description': 'Manage the structure of "{{0}}".',
      'account.organization.hierarchies': 'Company Structure',
    });
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should display organizations root after init', () => {
    fixture.detectChanges();
    expect(component.items$).toBeTruthy();
    expect(element.querySelector('div').textContent).toMatchInlineSnapshot(`" Manage the structure of \\"ROOT\\". "`);
  });

  it('should not display organizations in case of error', () => {
    when(organizationManagementFacade.groups$()).thenReturn(of());
    when(organizationManagementFacade.groupsError$).thenReturn(of({} as HttpError));
    fixture.detectChanges();
    expect(element.querySelector('h1.a')).toBeFalsy();
    expect(element).toMatchInlineSnapshot(`
      <h1>Company Structure</h1>
      <ish-error-message></ish-error-message>
      <div class="loading-container"></div>
    `);
  });

  it('should map group tree data after init', () => {
    const treeItems = component.mapToTreeItems(groupTree, ['root']);
    expect(treeItems).toBeArrayOfSize(1);
    expect(treeItems[0]).toMatchInlineSnapshot(`
      Object {
        "checked": false,
        "children": Array [
          Object {
            "checked": false,
            "children": Array [],
            "collapsed": false,
            "disabled": false,
            "text": "Child",
            "value": Object {
              "id": "child",
              "name": "Child",
              "organization": "acme.org",
            },
          },
        ],
        "collapsed": false,
        "disabled": false,
        "text": "ROOT",
        "value": Object {
          "id": "root",
          "name": "ROOT",
          "organization": "acme.org",
        },
      }
    `);
  });
});
