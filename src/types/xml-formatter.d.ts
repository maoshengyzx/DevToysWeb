declare module 'xml-formatter' {
  interface XmlFormatterOptions {
    indentation?: string;
    collapseContent?: boolean;
    lineSeparator?: string;
    whiteSpaceAtEndOfSelfclosingTag?: boolean;
  }

  function xmlFormatter(xml: string, options?: XmlFormatterOptions): string;

  export = xmlFormatter;
}