import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: settings, error } = await supabase
      .from('account_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          starting_balance: 0,
        })
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET account settings error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { starting_balance } = body

    if (
      typeof starting_balance !== 'number' ||
      starting_balance < 0
    ) {
      return NextResponse.json(
        { error: 'Invalid starting balance' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('account_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Account settings already exist' },
        { status: 409 }
      )
    }

    const { data: settings, error } = await supabase
      .from('account_settings')
      .insert({
        user_id: user.id,
        starting_balance,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('POST account settings error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { starting_balance } = body

    if (
      typeof starting_balance !== 'number' ||
      starting_balance < 0
    ) {
      return NextResponse.json(
        { error: 'Invalid starting balance' },
        { status: 400 }
      )
    }

    const { data: settings, error } = await supabase
      .from('account_settings')
      .update({
        starting_balance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('PUT account settings error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}