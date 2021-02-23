/* SystemJS module definition */
declare var module: NodeModule;

interface NodeModule {
  id: string;
}

declare var PRODUCTION_MODE: boolean;

declare var NGRX_RUNTIME_CHECKS: boolean;

declare var PWA_VERSION: string;
