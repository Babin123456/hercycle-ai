import { useTranslations, useLocale } from 'next-intl'

/**
 * CycleCalendar — renders a monthly grid with period/ovulation/predicted/today markers.
 * Now fully interactive with custom date selection, logged symptoms display,
 * month/year dropdowns, and arrow-key keyboard navigation.
 */
export default function CycleCalendar({
  // Mode A
  calendarDays: calendarDaysProp,
  // Mode B
  periodDays,
  ovulationDays,
  predictedDays,
  today: todayStr,
  viewYear,
  viewMonth,
  setViewYear,
  setViewMonth,
  // Shared
  currentMonth,
  onPrevMonth,
  onNextMonth,
  averageCycleLength,
  daysUntilNext,
  // Interactive Props
  selectedDate,
  onSelectDate,
  logMap
}) {
  const t = useTranslations('cycle')
  const tSymp = useTranslations('symptoms')
  const locale = useLocale()

  const monthNames = locale === 'hi'
    ? ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  // Build calendar from explicit Sets if Mode B props are provided
  let calendarDays = calendarDaysProp
  if (!calendarDays && viewYear != null && viewMonth != null) {
    const firstDay        = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()
    const days = []
    
    const weekDays = locale === 'hi' ? ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] : ['S','M','T','W','T','F','S']
    weekDays.forEach(h => days.push({ type: 'header', label: h }))
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ type: 'empty', label: daysInPrevMonth - i })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(i).padStart(2,'0')}`
      const isToday = iso === todayStr
      let type = 'normal'
      if (periodDays?.has(iso))                 type = 'period'
      else if (predictedDays?.has(iso))         type = 'predicted'
      else if (ovulationDays?.has(iso))         type = 'ovulation'
      if (isToday && type === 'normal')         type = 'today'
      days.push({ type, label: i, isToday, iso })
    }
    calendarDays = days
  }

  const handleKeyDown = (e, index, dayIso) => {
    let targetIdx = -1
    if (e.key === 'ArrowLeft') {
      targetIdx = index - 1
    } else if (e.key === 'ArrowRight') {
      targetIdx = index + 1
    } else if (e.key === 'ArrowUp') {
      targetIdx = index - 7
    } else if (e.key === 'ArrowDown') {
      targetIdx = index + 7
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (dayIso) {
        onSelectDate?.(dayIso)
      }
      return
    } else {
      return
    }

    if (targetIdx >= 0 && targetIdx < (calendarDays || []).length) {
      const targetDay = calendarDays[targetIdx]
      if (targetDay && targetDay.type !== 'header' && targetDay.type !== 'empty') {
        const el = document.querySelector(`[data-day-idx="${targetIdx}"]`)
        if (el && el.getAttribute('tabindex') === '0') {
          e.preventDefault()
          el.focus()
        }
      }
    }
  }

  return (
    <div className="cycle-card glass">
      <div className="cycle-card-header">
        {setViewMonth && setViewYear && viewYear != null && viewMonth != null ? (
          <div className="cal-selectors">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value))}
              className="cal-select"
              aria-label="Select month"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value))}
              className="cal-select"
              aria-label="Select year"
            >
              {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 7 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        ) : (
          <h3>{currentMonth}</h3>
        )}
        <div className="month-nav">
          <button onClick={onPrevMonth} aria-label="Previous month">‹</button>
          <button onClick={onNextMonth} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="mini-cal">
        {(calendarDays || []).map((day, i) => {
          const isHeader = day.type === 'header'
          const isEmpty = day.type === 'empty'
          const dayIso = day.iso || (!isHeader && !isEmpty && viewYear != null && viewMonth != null
            ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day.label).padStart(2, '0')}`
            : null)

          const isSelected = dayIso && dayIso === selectedDate
          const hasLog = dayIso && logMap && logMap.has(dayIso)
          const log = hasLog ? logMap.get(dayIso) : null

          let tooltipTitle = ''
          if (dayIso) {
            const phaseLabel = day.type === 'period' ? t('period')
              : day.type === 'predicted' ? t('predicted')
              : day.type === 'ovulation' ? t('ovulation')
              : day.type === 'today' ? 'Today'
              : ''

            if (phaseLabel) tooltipTitle += `${phaseLabel}\n`

            if (hasLog && log) {
              const items = []
              if (log.symptoms && log.symptoms.length > 0) {
                const sympsList = log.symptoms.map(s => {
                  try { return tSymp(s) } catch { return s }
                })
                items.push(`Symptoms: ${sympsList.join(', ')}`)
              }
              if (log.mood) {
                items.push(`Mood: ${log.mood}`)
              }
              if (log.flow) {
                const flowLabels = { f1: 'Light', f2: 'Medium', f3: 'Heavy', f4: 'Very Heavy' }
                const label = flowLabels[log.flow] || log.flow
                items.push(`Flow: ${label}`)
              }
              if (items.length > 0) {
                tooltipTitle += `Logged:\n- ${items.join('\n- ')}`
              }
            }
          }

          const isInteractive = dayIso && onSelectDate

          return (
            <div
              key={i}
              data-day-idx={i}
              tabIndex={isInteractive ? 0 : undefined}
              role={isInteractive ? 'button' : undefined}
              aria-label={dayIso ? `${dayIso}${isSelected ? ', selected' : ''}` : undefined}
              onClick={isInteractive ? () => onSelectDate(dayIso) : undefined}
              onKeyDown={isInteractive ? (e) => handleKeyDown(e, i, dayIso) : undefined}
              title={tooltipTitle || undefined}
              className={[
                'cal-d',
                day.type === 'header'    ? 'header'    : '',
                day.type === 'empty'     ? 'empty'     : '',
                day.type === 'period'    ? 'period'    : '',
                day.type === 'predicted' ? 'predicted' : '',
                day.type === 'ovulation' ? 'ovulation' : '',
                day.type === 'today'     ? 'today'     : '',
                day.isToday && day.type !== 'today' ? 'today-ring' : '',
                isSelected               ? 'selected'  : '',
              ].join(' ').trim()}
            >
              {day.label}
              {hasLog && <span className="log-indicator-dot" />}
            </div>
          )
        })}
      </div>

      <div className="cal-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'linear-gradient(135deg, rgba(232,82,126,0.35), rgba(157,63,122,0.30))' }}></div>
          <span>{t('period')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'rgba(232,82,126,0.15)', border: '1.5px dashed rgba(232,82,126,0.5)' }}></div>
          <span>{t('predicted')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'rgba(110,231,183,0.20)', border: '1px solid rgba(110,231,183,0.4)' }}></div>
          <span>{t('ovulation')}</span>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <label>{t('cycleLen')}</label>
          <div className="val">{averageCycleLength}<span>{t('days')}</span></div>
        </div>
        <div className="stat-tile">
          <label>{t('nextPeriod')}</label>
          <div className="val">
            {daysUntilNext !== null ? daysUntilNext : '—'}
            <span>{daysUntilNext !== null ? t('days') : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
