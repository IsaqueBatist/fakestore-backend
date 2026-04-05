import i18next from "i18next";
import i18nMiddleware from "i18next-http-middleware";
import { setLocale } from "yup";
import { resources } from "./resources";

setLocale({
  mixed: {
    required: "validation:mixed.required",
    notType: "validation:mixed.notType",
    defined: "validation:mixed.defined",
    oneOf: "validation:mixed.oneOf",
    notOneOf: "validation:mixed.notOneOf",
  },
  string: {
    lowercase: "validation:string.lowercase",
    uppercase: "validation:string.uppercase",
    url: "validation:string.url",
    max: "validation:string.max",
    min: "validation:string.min",
    email: "validation:string.email",
    length: "validation:string.length",
    uuid: "validation:string.uuid",
    trim: "validation:string.trim",
    matches: "validation:string.matches",
  },
  number: {
    min: "validation:number.min",
    max: "validation:number.max",
    integer: "validation:number.integer",
    lessThan: "validation:number.lessThan",
    moreThan: "validation:number.moreThan",
    positive: "validation:number.positive",
    negative: "validation:number.negative",
  },
  date: {
    min: "validation:date.min",
    max: "validation:date.max",
  },
  array: {
    min: "validation:array.min",
    max: "validation:array.max",
    length: "validation:array.length",
  },
  object: {
    noUnknown: "validation:object.noUnknown",
  },
});

i18next.use(i18nMiddleware.LanguageDetector).init({
  fallbackLng: "pt-BR",
  supportedLngs: ["pt-BR", "en"],
  ns: ["common", "validation", "errors"],
  defaultNS: "common",
  resources,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ["header"],
    lookupHeader: "accept-language",
  },
});

export { i18next, i18nMiddleware };
