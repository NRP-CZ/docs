import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import GitHubCode from './components/githubcode'

const docsComponents = getDocsMDXComponents()
 
export function useMDXComponents(components) {
  return {
    ...docsComponents,
    ...components,
    // ... your additional components
    GitHubCode
  }
}