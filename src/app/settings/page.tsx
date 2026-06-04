'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface MasterDataItem {
  id: string
  name: string
  user_id: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [masterData, setMasterData] = useState<{
    pairs: MasterDataItem[]
    setups: MasterDataItem[]
    mistakes: MasterDataItem[]
    btcContexts: MasterDataItem[]
    oiConditions: MasterDataItem[]
    fundingConditions: MasterDataItem[]
    triggers: MasterDataItem[]
  }>({
    pairs: [],
    setups: [],
    mistakes: [],
    btcContexts: [],
    oiConditions: [],
    fundingConditions: [],
    triggers: [],
  })
  const [newItems, setNewItems] = useState({
    pairs: '',
    setups: '',
    mistakes: '',
    btc: '',
    oi: '',
    funding: '',
    triggers: '',
  })

  useEffect(() => {
    fetchMasterData()
  }, [])

  const fetchMasterData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const [pairs, setups, mistakes, btcContexts, oiConditions, fundingConditions, triggers] = await Promise.all([
        supabase.from('pairs').select('*'),
        supabase.from('trade_setups').select('*'),
        supabase.from('mistakes').select('*'),
        supabase.from('btc_contexts').select('*'),
        supabase.from('oi_conditions').select('*'),
        supabase.from('funding_conditions').select('*'),
        supabase.from('triggers').select('*'),
      ])

      setMasterData({
        pairs: pairs.data || [],
        setups: setups.data || [],
        mistakes: mistakes.data || [],
        btcContexts: btcContexts.data || [],
        oiConditions: oiConditions.data || [],
        fundingConditions: fundingConditions.data || [],
        triggers: triggers.data || [],
      })
    } catch (error) {
      console.error('Error fetching master data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (type: keyof typeof newItems, table: string) => {
    const value = newItems[type]
    if (!value.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value',
        variant: 'destructive',
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from(table)
        .insert({ name: value })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Added successfully',
        duration: 1000,
      })
      setNewItems({ ...newItems, [type]: '' })
      fetchMasterData()
    } catch (error) {
      console.error('Error adding item:', error)
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, table: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Deleted successfully',
        duration: 1000,
      })
      fetchMasterData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your master data</p>
      </div>

      <Tabs defaultValue="pairs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 h-auto gap-1">
          <TabsTrigger value="pairs" className="text-[10px] px-1 py-2">
            Pairs
          </TabsTrigger>

          <TabsTrigger value="setups" className="text-[10px] px-1 py-2">
            Setups
          </TabsTrigger>

          <TabsTrigger value="mistakes" className="text-[10px] px-1 py-2">
            Mistakes
          </TabsTrigger>

          <TabsTrigger value="btc" className="text-[10px] px-1 py-2">
            BTC
          </TabsTrigger>

          <TabsTrigger value="oi" className="text-[10px] px-1 py-2">
            OI
          </TabsTrigger>

          <TabsTrigger value="funding" className="text-[10px] px-1 py-2">
            Funding
          </TabsTrigger>

          <TabsTrigger value="triggers" className="text-[10px] px-1 py-2">
            Trigger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pairs">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Trading Pairs</CardTitle>
              <CardDescription className="text-sm">Manage your trading pairs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New pair name" 
                    className="flex-1" 
                    value={newItems.pairs}
                    onChange={(e) => setNewItems({ ...newItems, pairs: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('pairs', 'pairs')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.pairs.map((pair) => (
                      <TableRow key={pair.id}>
                        <TableCell>{pair.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(pair.id, 'pairs')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.pairs.map((pair) => (
                    <div key={pair.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{pair.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(pair.id, 'pairs')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setups">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Trade Setups</CardTitle>
              <CardDescription className="text-sm">Manage your trade setups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New setup name" 
                    className="flex-1" 
                    value={newItems.setups}
                    onChange={(e) => setNewItems({ ...newItems, setups: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('setups', 'trade_setups')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.setups.map((setup) => (
                      <TableRow key={setup.id}>
                        <TableCell>{setup.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(setup.id, 'trade_setups')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.setups.map((setup) => (
                    <div key={setup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{setup.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(setup.id, 'trade_setups')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Common Mistakes</CardTitle>
              <CardDescription className="text-sm">Manage your common trading mistakes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New mistake name" 
                    className="flex-1" 
                    value={newItems.mistakes}
                    onChange={(e) => setNewItems({ ...newItems, mistakes: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('mistakes', 'mistakes')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.mistakes.map((mistake) => (
                      <TableRow key={mistake.id}>
                        <TableCell>{mistake.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(mistake.id, 'mistakes')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.mistakes.map((mistake) => (
                    <div key={mistake.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{mistake.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(mistake.id, 'mistakes')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="btc">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">BTC Contexts</CardTitle>
              <CardDescription className="text-sm">Manage BTC market contexts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New BTC context" 
                    className="flex-1" 
                    value={newItems.btc}
                    onChange={(e) => setNewItems({ ...newItems, btc: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('btc', 'btc_contexts')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.btcContexts.map((context) => (
                      <TableRow key={context.id}>
                        <TableCell>{context.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(context.id, 'btc_contexts')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.btcContexts.map((context) => (
                    <div key={context.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{context.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(context.id, 'btc_contexts')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oi">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">OI Conditions</CardTitle>
              <CardDescription className="text-sm">Manage Open Interest conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New OI condition" 
                    className="flex-1" 
                    value={newItems.oi}
                    onChange={(e) => setNewItems({ ...newItems, oi: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('oi', 'oi_conditions')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.oiConditions.map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell>{condition.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(condition.id, 'oi_conditions')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.oiConditions.map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{condition.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(condition.id, 'oi_conditions')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Funding Conditions</CardTitle>
              <CardDescription className="text-sm">Manage funding rate conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New funding condition" 
                    className="flex-1" 
                    value={newItems.funding}
                    onChange={(e) => setNewItems({ ...newItems, funding: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('funding', 'funding_conditions')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.fundingConditions.map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell>{condition.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(condition.id, 'funding_conditions')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.fundingConditions.map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{condition.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(condition.id, 'funding_conditions')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Triggers</CardTitle>
              <CardDescription className="text-sm">Manage your trading triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="New trigger" 
                    className="flex-1" 
                    value={newItems.triggers}
                    onChange={(e) => setNewItems({ ...newItems, triggers: e.target.value })}
                  />
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => handleAdd('triggers', 'triggers')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Desktop Table View */}
                <div className="rounded-md border hidden md:block">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterData.triggers.map((trigger) => (
                      <TableRow key={trigger.id}>
                        <TableCell>{trigger.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(trigger.id, 'triggers')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2">
                  {masterData.triggers.map((trigger) => (
                    <div key={trigger.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{trigger.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(trigger.id, 'triggers')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
