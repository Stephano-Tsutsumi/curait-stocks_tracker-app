import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/nodemailer';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
    try {
        const { testType } = await request.json();
        
        if (testType === 'direct') {
            // Test direct Nodemailer functionality
            console.log('Testing direct Nodemailer...');
            
            const testEmail = {
                email: 'test@example.com',
                name: 'Test User',
                intro: 'This is a test email to verify Nodemailer is working correctly with your Gmail configuration.'
            };
            
            await sendWelcomeEmail(testEmail);
            
            return NextResponse.json({ 
                success: true, 
                message: 'Direct email test sent successfully' 
            });
        }
        
        if (testType === 'inngest') {
            // Test Inngest + Nodemailer integration
            console.log('Testing Inngest + Nodemailer integration...');
            
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email: 'test@example.com',
                    name: 'Test User',
                    country: 'United States',
                    investmentGoals: 'Long-term growth',
                    riskTolerance: 'Moderate',
                    preferredIndustry: 'Technology'
                }
            });
            
            return NextResponse.json({ 
                success: true, 
                message: 'Inngest event sent successfully - check your email!' 
            });
        }
        
        return NextResponse.json({ 
            success: false, 
            error: 'Invalid test type. Use "direct" or "inngest"' 
        });
        
    } catch (error) {
        console.error('Email test failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: `Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
    }
}
