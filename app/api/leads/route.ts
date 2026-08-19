import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  currentBank: string;
  loanAmount: number;
  currentEmi: number;
  potentialSavings: number;
  toolType: 'calculator' | 'balance-transfer';
}

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the lead (in production, this would save to database)
    console.log('New Lead Submission:', {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // TODO: In Phase 2, integrate with:
    // 1. Database (Sequelize model)
    // 2. Email service (send confirmation email)
    // 3. CRM system (sync with sales team)
    // 4. Analytics (track conversions)

    // For now, return success
    return NextResponse.json(
      {
        success: true,
        message: 'Lead submitted successfully',
        leadId: Math.random().toString(36).substring(7),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
