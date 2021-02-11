import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { Attribute } from 'ish-core/models/attribute/attribute.model';
import { Link } from 'ish-core/models/link/link.model';
import { ApiService, unpackEnvelope } from 'ish-core/services/api/api.service';
import { getLoggedInCustomer } from 'ish-core/store/customer/user';
import { CookiesService } from 'ish-core/utils/cookies/cookies.service';
import { whenTruthy } from 'ish-core/utils/operators';

import { PunchoutUser } from '../../models/punchout-user/punchout-user.model';

export type PunchoutType = 'oci' | 'cxml';

@Injectable({ providedIn: 'root' })
export class PunchoutService {
  constructor(private apiService: ApiService, private cookiesService: CookiesService, private store: Store) {}

  private currentCustomer$ = this.store.pipe(select(getLoggedInCustomer), whenTruthy(), take(1));

  /**
   * Gets the list of punchout users.
   * @returns    An array of punchout users.
   */
  getUsers(): Observable<PunchoutUser[]> {
    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService.get(`customers/${customer.customerNo}/punchouts/oci/users`).pipe(
          unpackEnvelope<Link>(),
          this.apiService.resolveLinks<PunchoutUser>(),
          map(users => users.map(user => ({ ...user, password: undefined })))
        )
      )
    );
  }

  /**
   * Creates a punchout user.
   * @param user    The punchout user.
   * @returns       The created punchout user.
   */
  createUser(user: PunchoutUser): Observable<PunchoutUser> {
    if (!user) {
      return throwError('createUser() of the punchout service called without punchout user');
    }

    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService.post(`customers/${customer.customerNo}/punchouts/oci/users`, user).pipe(
          this.apiService.resolveLink<PunchoutUser>(),
          map(updatedUser => ({ ...updatedUser, password: undefined }))
        )
      )
    );
  }

  /**
   * Updates a punchout user.
   * @param user    The punchout user.
   * @returns       The updated punchout user.
   */
  updateUser(user: PunchoutUser): Observable<PunchoutUser> {
    if (!user) {
      return throwError('updateUser() of the punchout service called without punchout user');
    }

    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService
          .put<PunchoutUser>(`customers/${customer.customerNo}/punchouts/oci/users/${user.login}`, user)
          .pipe(map(updatedUser => ({ ...updatedUser, password: undefined })))
      )
    );
  }

  /**
   * Deletes a punchout user.
   * @param login   The login of the punchout user.
   */
  deleteUser(login: string): Observable<void> {
    if (!login) {
      return throwError('deleteUser() of the punchout service called without login');
    }

    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService.delete<void>(`customers/${customer.customerNo}/punchouts/oci/users/${login}`)
      )
    );
  }

  /**
   * Gets a JSON object with the necessary punchout data for the basket transfer.
   * @param basketId   The basket id for the punchout.
   */
  getBasketPunchoutData(basketId: string): Observable<Attribute<string>[]> {
    if (!basketId) {
      return throwError('getBasketPunchoutData() of the punchout service called without basketId');
    }

    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService
          .post<{ data: Attribute<string>[] }>(`customers/${customer.customerNo}/punchouts/oci/transfer`, undefined, {
            params: new HttpParams().set('basketId', basketId),
          })
          .pipe(map(data => data.data))
      )
    );
  }

  /**
   * Gets a JSON object with the necessary punchout data for the product validation.
   * @param productSKU   The product SKU of the product to validate.
   * @param quantity     The quantity for the validation.
   */
  getProductPunchoutData(productSKU: string, quantity: string): Observable<Attribute<string>[]> {
    if (!productSKU) {
      return throwError('getProductPunchoutData() of the punchout service called without productSKU');
    }

    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService
          .get<{ data: Attribute<string>[] }>(`customers/${customer.customerNo}/punchouts/oci/validate`, {
            params: new HttpParams().set('productSKU', productSKU).set('quantity', quantity),
          })
          .pipe(map(data => data.data))
      )
    );
  }

  /**
   * Gets a JSON object with the necessary punchout data for the background search.
   * @param searchString   The search string to search punchout products.
   */
  getSearchPunchoutData(searchString: string): Observable<Attribute<string>[]> {
    if (!searchString) {
      return throwError('getSearchPunchoutData() of the punchout service called without searchString');
    }

    return this.currentCustomer$.pipe(
      switchMap(customer =>
        this.apiService
          .get<{ data: Attribute<string>[] }>(`customers/${customer.customerNo}/punchouts/oci/search`, {
            params: new HttpParams().set('searchString', searchString),
          })
          .pipe(map(data => data.data))
      )
    );
  }

  /**
   * Submits the punchout data via HTML form to the punchout system configured in the HOOK_URL
   * @param data     The punchout data retrieved from ICM.
   * @param submit   Controls whether the HTML form is actually submitted (default) or not (only created in the document body).
   */
  submitPunchoutData(data: Attribute<string>[], type: PunchoutType, submit = true) {
    if (!data || !data.length) {
      return throwError('submitPunchoutData() of the punchout service called without data');
    }

    // create a form
    let form: HTMLFormElement;

    // prepare the form according to the given punchout type
    if (type === 'oci') {
      const hookUrl = this.cookiesService.get('hookURL');
      if (!hookUrl) {
        return throwError('no HOOK_URL available in cookies for OCI Punchout submitPunchoutData()');
      }
      form = this.createOciForm(data, hookUrl);
    } else if (type === 'cxml') {
      form = this.createCxmlForm();
    }

    // replace the document content with the form and submit the form
    document.body.innerHTML = '';
    document.body.appendChild(form);
    if (submit) {
      form.submit();
    }
  }

  /**
   * Creates an OCI punchout compatible form with hidden input fields that reflect the attributes of the punchout data.
   * @param   data      Attributes (key value pair) array
   * @param   hookUrl   The hook URL
   * @returns           The OCI punchout form
   */
  private createOciForm(data: Attribute<string>[], hookUrl: string): HTMLFormElement {
    const ociForm = document.createElement('form');
    ociForm.method = 'post';
    ociForm.action = hookUrl;
    data.forEach(inputData => {
      const input = document.createElement('input'); // prepare a new input DOM element
      input.setAttribute('name', inputData.name); // set the param name
      input.setAttribute('value', inputData.value); // set the value
      input.setAttribute('type', 'hidden'); // set the type "hidden"
      ociForm.appendChild(input); // add the input to the OCI form
    });
    return ociForm;
  }

  /**
   * Creates an cXML punchout compatible form with a hidden input field that contains the cXML PunchOutOrderMessage.
   * @param   punchOutOrderMessage
   * @param   browserFormPostUrl
   * @returns           The cXML punchout form
   */
  private createCxmlForm(
    punchOutOrderMessage = `<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="958074737352&www.workchairs.com"
 timestamp="2004-06-14T12:59:09-07:00">
	<Header>
		<From>
			<Credential domain="DUNS">
				<Identity>12345678</Identity>
			</Credential>
		</From>
		<To>
			<Credential domain="NetworkID">
				<Identity>AN01000002792</Identity>
			</Credential>
		</To>
		<Sender>
			<Credential domain="www.workchairs.com">
				<Identity>PunchoutResponse</Identity>
			</Credential>
			<UserAgent>Our PunchOut Site V4.2</UserAgent>
		</Sender>
	</Header>
	<Message>
		<PunchOutOrderMessage>
			<BuyerCookie>1J3YVWU9QWMTB</BuyerCookie>
			<PunchOutOrderMessageHeader operationAllowed="create">
				<Total>
					<Money currency="USD">14.27</Money>
				</Total>
			</PunchOutOrderMessageHeader>
			<ItemIn quantity="2">
				<ItemID>
					<SupplierPartID>3171 04 20</SupplierPartID>
					<SupplierPartAuxiliaryID>ContractId=1751
					    ItemId=417714 </SupplierPartAuxiliaryID>
				</ItemID>
				<ItemDetail>
					<UnitPrice>
						<Money currency="USD">1.22</Money>
					</UnitPrice>
					<Description xml:lang="en">ADAPTER; TUBE; 5/32";
					    MALE; #10-32 UNF; FITTING
					</Description>
					<UnitOfMeasure>EA</UnitOfMeasure>
					<Classification domain="UNSPSC">21101510</Classification>
					<ManufacturerName>Dogwood</ManufacturerName>
				</ItemDetail>
			</ItemIn>
			<ItemIn quantity="1">
				<ItemID>
					<SupplierPartID>3801 04 20</SupplierPartID>
						<SupplierPartAuxiliaryID> ContractId=1751
						    ItemId=417769 </SupplierPartAuxiliaryID>
				</ItemID>
				<ItemDetail>
					<UnitPrice>
						<Money currency="USD">11.83</Money>
					</UnitPrice>
					<Description xml:lang="en">ADAPTER; TUBE; 5/32"; 2 PER PACK;
							MALE #10-32 UNF; STAINLESS STEEL; FITTING<
					</Description>
					<UnitOfMeasure>EA</UnitOfMeasure>
					<Classification domain="UNSPSC">21101510</Classification>
					<ManufacturerName>Legris</ManufacturerName>
					<LeadTime>2</LeadTime>
				</ItemDetail>
				<SupplierID domain="DUNS">022878979</SupplierID>
			</ItemIn>
		</PunchOutOrderMessage>
	</Message>
</cXML>`,
    browserFormPostUrl = 'https://punchoutcommerce.com/tools/cxml-punchout-return'
  ): HTMLFormElement {
    const cXmlForm = document.createElement('form');
    cXmlForm.method = 'post';
    cXmlForm.action = browserFormPostUrl;
    cXmlForm.enctype = 'application/x-www-form-urlencoded';
    const input = document.createElement('input');
    input.setAttribute('name', 'cXML-urlencoded');
    input.setAttribute('value', punchOutOrderMessage); // set the cXML value
    input.setAttribute('type', 'hidden');
    cXmlForm.appendChild(input);
    return cXmlForm;
  }
}
