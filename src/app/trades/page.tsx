'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function TradesPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const router = useRouter()
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')

  useEffect(() => {
    fetchTrades()
  }, [searchTerm])

  const fetchTrades = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false })

      if (searchTerm) {
        query = query.or(`pair.ilike.%${searchTerm}%,setup.ilike.%${searchTerm}%`)
      }

      const { data: tradesData } = await query
      setTrades(tradesData || [])
    } catch (error) {
      console.error('Error fetching trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trade?')) return

    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete trade')
      }

      setTrades(trades.filter(trade => trade.id !== id))
    } catch (error) {
      console.error('Error deleting trade:', error)
      alert('Failed to delete trade')
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Trade Log</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and manage your trading history</p>
        </div>
        <Link href="/trades/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by pair or setup..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          <div className="rounded-md border hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Result %</TableHead>
                  <TableHead>Result USDT</TableHead>
                  <TableHead>RR</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No trades found. Start by adding your first trade.
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{new Date(trade.trade_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{trade.pair}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          trade.direction === 'Long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {trade.direction}
                        </span>
                      </TableCell>
                      <TableCell>{trade.setup}</TableCell>
                      <TableCell className={Number(trade.result_percent) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {Number(trade.result_percent) >= 0 ? '+' : ''}{trade.result_percent}%
                      </TableCell>
                      <TableCell className={Number(trade.result_usdt) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${Number(trade.result_usdt) >= 0 ? '+' : ''}{trade.result_usdt}
                      </TableCell>
                      <TableCell>{trade.rr}</TableCell>
                      <TableCell>
                        {trade.plan_followed ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-red-500">✗</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/trades/${trade.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/trades/${trade.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(trade.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Mobile Card View */}
      {!loading && (
        <div className="md:hidden space-y-3">
          {trades.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No trades found. Start by adding your first trade.
            </div>
          ) : (
            trades.map((trade) => (
              <Card key={trade.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-base">{trade.pair}</div>
                      <div className="text-xs text-muted-foreground">{new Date(trade.trade_date).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      trade.direction === 'Long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {trade.direction}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-muted-foreground">Setup:</span>
                      <span className="ml-1">{trade.setup}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RR:</span>
                      <span className="ml-1">{trade.rr}</span>
                    </div>
                    <div className={Number(trade.result_percent) >= 0 ? 'text-green-500' : 'text-red-500'}>
                      <span className="text-muted-foreground">Result %:</span>
                      <span className="ml-1">{Number(trade.result_percent) >= 0 ? '+' : ''}{trade.result_percent}%</span>
                    </div>
                    <div className={Number(trade.result_usdt) >= 0 ? 'text-green-500' : 'text-red-500'}>
                      <span className="text-muted-foreground">Result USDT:</span>
                      <span className="ml-1">${Number(trade.result_usdt) >= 0 ? '+' : ''}{trade.result_usdt}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="ml-1">{trade.plan_followed ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}</span>
                    </div>
                    {trade.mistake && (
                      <div>
                        <span className="text-muted-foreground">Mistake:</span>
                        <span className="ml-1 text-red-500">{trade.mistake}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Link href={`/trades/${trade.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/trades/${trade.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(trade.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
