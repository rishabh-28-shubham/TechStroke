import React from 'react'
import SnippetList from '../components/Snippets/SnippetList'
import { Code2 } from 'lucide-react'

const Snippets = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#6366F1] flex items-center justify-center gap-2">
          <Code2 className="h-8 w-8" />
          Code Snippets
        </h1>
        <p className="text-gray-600">Save and organize your code snippets with syntax highlighting</p>
      </div>
      <SnippetList />
    </div>
  )
}

export default Snippets