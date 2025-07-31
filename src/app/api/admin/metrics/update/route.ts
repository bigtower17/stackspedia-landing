import { NextRequest, NextResponse } from 'next/server';
import { metricsUpdater } from '@/lib/metrics-updater';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const {
      project_id,
      force_update = false,
      max_age = 24,
      delay_ms = 1000
    } = body;
    
    // Se specificato project_id, aggiorna singolo progetto
    if (project_id) {
      const result = await metricsUpdater.updateSingleProject(project_id);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Progetto aggiornato con successo',
          data: result.data
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 400 });
      }
    }
    
    // Altrimenti aggiorna tutti i progetti
    const result = await metricsUpdater.updateAllProjectMetrics({
      forceUpdate: force_update,
      maxAge: max_age,
      delayMs: delay_ms
    });
    
    return NextResponse.json({
      success: true,
      message: 'Aggiornamento completato',
      stats: {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        skipped: result.skipped
      },
      errors: result.errors,
      rate_limit: result.rate_limit
    });
    
  } catch (error) {
    console.error('Errore aggiornamento metriche:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore del server'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = await metricsUpdater.getUpdateStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Errore recupero statistiche:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore del server'
    }, { status: 500 });
  }
}