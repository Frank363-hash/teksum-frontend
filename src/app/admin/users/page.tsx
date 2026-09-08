"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Loader2, Search, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { apiFetch, formatDate } from "@/lib/teksum-api"

type AdminUser = {
  id: string
  email: string
  phone: string
  status: string
  isVerified: boolean
  createdAt: string
}

export default function Page() {
  const [q, setQ] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  const [adminIdentityReady, setAdminIdentityReady] = useState(false)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [type, setType] = useState("CREDIT")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function load() {
    setError("")
    try {
      const d = await apiFetch<{ items?: AdminUser[] }>(
        `/api/v1/admin/users?limit=50${q ? `&search=${encodeURIComponent(q)}` : ""}`,
      )
      setUsers(d.items || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load users")
    }
  }

  useEffect(() => {
    load().catch(() => {})
    apiFetch<{ id: string }>("/me", {}, { redirectOn401: false })
      .then((profile) => setCurrentAdminId(profile.id))
      .catch(() => setCurrentAdminId(null))
      .finally(() => setAdminIdentityReady(true))
  }, [])

  async function adjust(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    setBusy(true)
    setError("")
    try {
      await apiFetch("/api/v1/admin/wallet/adjust", {
        method: "POST",
        body: JSON.stringify({
          userId: selected.id,
          type,
          amount: Number(amount),
          reason,
        }),
      })
      setSelected(null)
      setAmount("")
      setReason("")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Adjustment failed")
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(user: AdminUser) {
    if (user.id === currentAdminId) return
    const isActive = user.status.toUpperCase() === "ACTIVE"
    if (user.status.toUpperCase() !== "ACTIVE" && user.status.toUpperCase() !== "SUSPENDED") return

    const nextStatus = isActive ? "SUSPENDED" : "ACTIVE"
    const action = isActive ? "deactivate" : "activate"
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.email}?`,
    )
    if (!confirmed) return

    setStatusBusyId(user.id)
    setError("")
    try {
      await apiFetch(`/api/v1/admin/users/${encodeURIComponent(user.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, status: nextStatus } : item,
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to change user status")
    } finally {
      setStatusBusyId(null)
    }
  }

  return (
    <div className="teksum-admin-page min-w-0 w-full">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">Administration</p>
        <h1 className="mt-1 text-3xl font-black">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by email, phone or user ID and perform audited wallet adjustments.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-0 flex-1 basis-64">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="Phone, email or user ID"
              />
            </div>
            <Button type="button" onClick={load}>Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="divide-y">
            {users.map((u) => {
              const normalizedStatus = u.status.toUpperCase()
              const canChangeStatus =
                adminIdentityReady &&
                currentAdminId !== null &&
                u.id !== currentAdminId &&
                (normalizedStatus === "ACTIVE" || normalizedStatus === "SUSPENDED")
              const changing = statusBusyId === u.id

              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.email}</p>
                    <p className="break-words text-xs text-muted-foreground">
                      {u.phone} • {u.id}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Joined {formatDate(u.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{u.status}</Badge>
                    <Badge variant="secondary">
                      {u.isVerified ? (
                        <><UserCheck className="mr-1 inline size-3" />Verified</>
                      ) : (
                        <><UserX className="mr-1 inline size-3" />Unverified</>
                      )}
                    </Badge>
                    {canChangeStatus && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={changing}
                        onClick={() => changeStatus(u)}
                        className="min-h-9"
                      >
                        {changing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : normalizedStatus === "ACTIVE" ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(u)}
                    >
                      Credit / Debit
                    </Button>
                  </div>
                </div>
              )
            })}
            {users.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <Card className="w-full max-w-md rounded-2xl">
            <CardHeader>
              <CardTitle>Adjust wallet</CardTitle>
              <p className="text-sm text-muted-foreground">{selected.email} • {selected.phone}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={adjust} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {["CREDIT", "DEBIT"].map((t) => (
                    <Button key={t} type="button" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>
                      {t}
                    </Button>
                  ))}
                </div>
                <Input type="number" min={0.01} step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <Input placeholder="Audit reason" value={reason} onChange={(e) => setReason(e.target.value)} minLength={3} required />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                  <Button type="submit" disabled={busy} className="bg-emerald-600 text-white">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : "Apply adjustment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
