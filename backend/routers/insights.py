from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool

from services import insights

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.post("/stats")
def stats(body: insights.HistoryBody):
    """No AI here: plain numbers and rule-based alerts."""
    return insights.compute_stats(body.history)


@router.post("/report")
async def report(body: insights.HistoryBody):
    if not body.history:
        raise HTTPException(400, "Run a few analyses first, then generate a report.")
    return await run_in_threadpool(insights.report, body.history)
