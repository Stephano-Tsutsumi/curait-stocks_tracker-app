import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/database/mongoose'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test the database connection
    await connectToDatabase()
    
    // If we get here, the connection was successful
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Testing database connection with POST...')
    
    // Test the database connection
    await connectToDatabase()
    
    // Test a simple database operation
    const { default: mongoose } = await import('mongoose')
    
    // Create a simple test document
    const testSchema = new mongoose.Schema({
      test: String,
      timestamp: Date
    })
    
    const TestModel = mongoose.models.Test || mongoose.model('Test', testSchema)
    
    const testDoc = new TestModel({
      test: 'Database connection test',
      timestamp: new Date()
    })
    
    await testDoc.save()
    
    // Clean up the test document
    await TestModel.deleteOne({ _id: testDoc._id })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and write operation successful!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
