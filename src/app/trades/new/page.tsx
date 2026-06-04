'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function NewTradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [masterData, setMasterData] = useState<{
    pairs: any[]
    setups: any[]
    mistakes: any[]
    btcContexts: any[]
    oiConditions: any[]
    fundingConditions: any[]
    triggers: any[]
  }>({
    pairs: [],
    setups: [],
    mistakes: [],
    btcContexts: [],
    oiConditions: [],
    fundingConditions: [],
    triggers: [],
  })
  const [formData, setFormData] = useState({
    pair: '',
    direction: 'Long',
    setup: '',
    btc_context: '',
    oi: '',
    funding: '',
    trigger: '',
    margin: '',
    leverage: '',
    rr: '',
    risk_percent: '',
    result_percent: '',
    plan_followed: false,
    mistake: '',
    notes: '',
  })

  useEffect(() => {
    fetchMasterData()
  }, [])

  const fetchMasterData = async () => {
    try {
      const supabase = createClient()
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const result_usdt = Number(formData.margin) * (Number(formData.result_percent) / 100)

      const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        trade_date: new Date().toISOString().split('T')[0],
        pair: formData.pair,
        direction: formData.direction,
        setup: formData.setup,
        btc_context: formData.btc_context,
        oi: formData.oi,
        funding: formData.funding,
        trigger: formData.trigger,
        margin: Number(formData.margin),
        leverage: Number(formData.leverage),
        rr: Number(formData.rr),
        risk_percent: Number(formData.risk_percent),
        result_percent: Number(formData.result_percent),
        result_usdt,
        plan_followed: formData.plan_followed,
        mistake: formData.mistake || null,
        notes: formData.notes || null,
      })

      if (error) throw error

      toast({
        title: 'Trade added successfully',
        description: 'Your trade has been recorded.',
      })

      router.push('/trades')
    } catch (error: any) {
      toast({
        title: 'Failed to add trade',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Add New Trade</h1>
          <p className="text-sm md:text-base text-muted-foreground">Record your trading details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Trade Information</CardTitle>
            <CardDescription className="text-sm">Fill in the details of your trade</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pair">Pair</Label>
                  <Select value={formData.pair} onValueChange={(value) => handleChange('pair', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.pairs.map((pair) => (
                        <SelectItem key={pair.id} value={pair.name}>
                          {pair.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction">Direction</Label>
                  <Select value={formData.direction} onValueChange={(value) => handleChange('direction', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup">Setup</Label>
                  <Select value={formData.setup} onValueChange={(value) => handleChange('setup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select setup" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.setups.map((setup) => (
                        <SelectItem key={setup.id} value={setup.name}>
                          {setup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="btc_context">BTC Context</Label>
                  <Select value={formData.btc_context} onValueChange={(value) => handleChange('btc_context', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BTC context" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.btcContexts.map((context) => (
                        <SelectItem key={context.id} value={context.name}>
                          {context.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oi">OI Condition</Label>
                  <Select value={formData.oi} onValueChange={(value) => handleChange('oi', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select OI condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.oiConditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.name}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funding">Funding</Label>
                  <Select value={formData.funding} onValueChange={(value) => handleChange('funding', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.fundingConditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.name}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select value={formData.trigger} onValueChange={(value) => handleChange('trigger', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.triggers.map((trigger) => (
                        <SelectItem key={trigger.id} value={trigger.name}>
                          {trigger.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margin (USDT)</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={formData.margin}
                    onChange={(e) => handleChange('margin', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leverage">Leverage (x)</Label>
                  <Input
                    id="leverage"
                    type="number"
                    placeholder="10"
                    value={formData.leverage}
                    onChange={(e) => handleChange('leverage', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rr">Risk/Reward Ratio</Label>
                  <Input
                    id="rr"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={formData.rr}
                    onChange={(e) => handleChange('rr', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_percent">Risk %</Label>
                  <Input
                    id="risk_percent"
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={formData.risk_percent}
                    onChange={(e) => handleChange('risk_percent', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result_percent">Result %</Label>
                  <Input
                    id="result_percent"
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={formData.result_percent}
                    onChange={(e) => handleChange('result_percent', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 flex items-center space-x-2">
                  <Checkbox
                    id="plan_followed"
                    checked={formData.plan_followed}
                    onCheckedChange={(checked) => handleChange('plan_followed', checked)}
                  />
                  <Label htmlFor="plan_followed">Plan Followed</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mistake">Mistake (if any)</Label>
                  <Select value={formData.mistake} onValueChange={(value) => handleChange('mistake', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mistake (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.mistakes.map((mistake) => (
                        <SelectItem key={mistake.id} value={mistake.name}>
                          {mistake.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this trade..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Saving...' : 'Save Trade'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/trades')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
