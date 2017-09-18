import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { CustomErrorHandler } from './custom-error-handler';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalizeRouterService } from './routes-parser-locale-currency/localize-router.service';

@Injectable()
export class ApiService {

  /**
   * Constructor
   * @param  {Http} privatehttp
   */
  constructor(private httpClient: HttpClient,
    private customErrorHandler: CustomErrorHandler,
    private localize: LocalizeRouterService) {
  }

  /**
   * format api errors and send errors to custom handler
   * @param  {any} error
   */
  private formatErrors(error: any) {
    return this.customErrorHandler.handleApiErrors(error);
  }

  /**
   * http get request
   * @param  {string} path
   * @param  {URLSearchParams=newURLSearchParams(} params
   * @returns Observable
   */
  get(path: string, params: HttpParams = new HttpParams(), headers?: HttpHeaders): Observable<any> {

    const loc = this.localize.parser.currentLocale;

    const url = `${environment.rest_url};loc=${loc.lang};cur=${loc.currency}/${path}`;

    return this.httpClient.get(url, { headers: headers })
      .catch(this.formatErrors.bind(this));
  }

  /**
   * http put request
   * @param  {string} path
   * @param  {Object={}} body
   * @returns Observable
   */
  put(path: string, body: Object = {}): Observable<any> {
    return this.httpClient.put(
      `${environment.rest_url}/${path}`,
      JSON.stringify(body)
    ).catch(this.formatErrors);
  }

  /**
   * http post request
   * @param  {string} path
   * @param  {Object={}} body
   * @returns Observable
   */
  post(path: string, body: Object = {}): Observable<any> {
    return this.httpClient.post(
      `${environment.rest_url}/${path}`,
      JSON.stringify(body)
    ).catch(this.formatErrors);
  }

  /**
   * http delete request
   * @param  {} path
   * @returns Observable
   */
  delete(path): Observable<any> {

    return this.httpClient.delete(
      `${environment.rest_url}/${path}`
    ).catch(this.formatErrors);

  }
}