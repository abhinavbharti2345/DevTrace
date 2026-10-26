import ts from 'typescript';
import { FileInfo, FileRole, ImportInfo, SymbolInfo } from '../types/index.js';

export function parseSourceFile(filePath: string, content: string): FileInfo {
  const extension = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  const isTest = isTestFile(filePath);

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true, // setParentNodes
    extension.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const symbols: SymbolInfo[] = [];
  const imports: ImportInfo[] = [];

  function getLine(node: ts.Node): number {
    return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  }

  function visit(node: ts.Node) {
    // 1. ES Import Declarations: import { a, b } from './module'
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        const importSource = moduleSpecifier.text;
        const specifiers: string[] = [];
        let isDefault = false;

        if (node.importClause) {
          if (node.importClause.name) {
            isDefault = true;
            specifiers.push(node.importClause.name.text);
          }
          if (node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              for (const element of node.importClause.namedBindings.elements) {
                specifiers.push(element.name.text);
              }
            } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
              specifiers.push(`* as ${node.importClause.namedBindings.name.text}`);
            }
          }
        }

        imports.push({
          source: importSource,
          specifiers,
          isDefault,
          line: getLine(node),
        });
      }
    }

    // 2. CommonJS Require: const { a } = require('./module')
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (decl.initializer && ts.isCallExpression(decl.initializer)) {
          const expression = decl.initializer.expression;
          if (ts.isIdentifier(expression) && expression.text === 'require') {
            const firstArg = decl.initializer.arguments[0];
            if (firstArg && ts.isStringLiteral(firstArg)) {
              const specifiers: string[] = [];
              if (ts.isIdentifier(decl.name)) {
                specifiers.push(decl.name.text);
              } else if (ts.isObjectBindingPattern(decl.name)) {
                for (const elem of decl.name.elements) {
                  if (ts.isIdentifier(elem.name)) {
                    specifiers.push(elem.name.text);
                  }
                }
              }
              imports.push({
                source: firstArg.text,
                specifiers,
                isDefault: true,
                line: getLine(node),
              });
            }
          }
        }
      }
    }

    // 3. Exported & Top-level Symbols: Functions, Classes, Interfaces, Enums, TypeAliases
    const isExported = hasExportModifier(node);

    if (ts.isFunctionDeclaration(node) && node.name) {
      symbols.push({
        name: node.name.text,
        kind: 'function',
        line: getLine(node),
        isExported,
      });
    } else if (ts.isClassDeclaration(node) && node.name) {
      symbols.push({
        name: node.name.text,
        kind: 'class',
        line: getLine(node),
        isExported,
      });
    } else if (ts.isInterfaceDeclaration(node)) {
      symbols.push({
        name: node.name.text,
        kind: 'interface',
        line: getLine(node),
        isExported,
      });
    } else if (ts.isTypeAliasDeclaration(node)) {
      symbols.push({
        name: node.name.text,
        kind: 'type',
        line: getLine(node),
        isExported,
      });
    } else if (ts.isEnumDeclaration(node)) {
      symbols.push({
        name: node.name.text,
        kind: 'enum',
        line: getLine(node),
        isExported,
      });
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          symbols.push({
            name: decl.name.text,
            kind: 'variable',
            line: getLine(decl),
            isExported,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    path: normalizePath(filePath),
    extension,
    size: Buffer.byteLength(content, 'utf8'),
    isTest,
    symbols,
    imports,
    content,
  };
}

function hasExportModifier(node: ts.Node): boolean {
  if (ts.canHaveModifiers(node)) {
    const modifiers = ts.getModifiers(node);
    return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  }
  return false;
}

export function isTestFile(filePath: string): boolean {
  const norm = filePath.toLowerCase();
  return (
    norm.includes('.test.') ||
    norm.includes('.spec.') ||
    norm.includes('__tests__') ||
    norm.includes('/test/') ||
    norm.includes('/tests/')
  );
}

export function determineFileRole(filePath: string, isTest: boolean, extension: string): FileRole {
  if (isTest) return 'test';
  const norm = filePath.toLowerCase();
  if (extension === '.tsx' || extension === '.jsx' || norm.includes('/components/') || norm.includes('/views/')) {
    return 'component';
  }
  if (norm.includes('/routes/') || norm.includes('/controllers/') || norm.includes('/api/')) {
    return 'route';
  }
  if (norm.includes('/services/') || norm.includes('/service/')) {
    return 'service';
  }
  if (norm.includes('/utils/') || norm.includes('/helpers/') || norm.includes('/lib/')) {
    return 'util';
  }
  if (norm.includes('/models/') || norm.includes('/types/') || norm.includes('/schema/')) {
    return 'model';
  }
  if (norm.includes('/config/') || norm.includes('config.') || norm.includes('constants.')) {
    return 'config';
  }
  return 'service';
}

export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '');
}
