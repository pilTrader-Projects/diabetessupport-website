'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface TenantContextType {
  tenantId: string | null
  branchId: string | null
  setContext: (tenantId: string, branchId?: string | null) => void
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [branchId, setBranchId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be fetched from the session/auth provider
    const storedTenant = localStorage.getItem('tenant_id')
    const storedBranch = localStorage.getItem('branch_id')
    
    if (storedTenant) setTenantId(storedTenant)
    if (storedBranch) setBranchId(storedBranch)
    
    setIsLoading(false)
  }, [])

  const setContext = (tId: string, bId: string | null = null) => {
    setTenantId(tId)
    setBranchId(bId)
    localStorage.setItem('tenant_id', tId)
    if (bId) localStorage.setItem('branch_id', bId)
    else localStorage.removeItem('branch_id')
  }

  return (
    <TenantContext.Provider value={{ tenantId, branchId, setContext, isLoading }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider')
  }
  return context
}
