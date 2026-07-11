import { useTranslations, useLocale } from 'next-intl'

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' }
]

const symptomIcons = {
  Cramps: "🔥",
  Headache: "🤕",
  Bloating: "🎈",
  Fatigue: "😴",
  Acne: "✨",
  Nausea: "🤢"
}

export default function DailyLogPanel({
  selectedSymptoms,
  toggleSymptom,
  selectedMood,
  setSelectedMood,
  selectedFlow,
  setSelectedFlow,
  handleSaveLog,
  cycleData,
  selectedDate
}) {
  const t = useTranslations('log')
  const tSymp = useTranslations('symptoms')
  const tFlow = useTranslations('flow')
  const locale = useLocale()

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = !selectedDate || selectedDate === todayStr

  const formattedDate = selectedDate ? (() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dateObj)
  })() : ''

  const displaySymptomsTitle = isToday
    ? t('symptoms')
    : locale === 'hi'
      ? `${formattedDate} के लक्षण`
      : `Symptoms for ${formattedDate}`

  const displayMoodTitle = isToday
    ? t('mood')
    : locale === 'hi'
      ? `${formattedDate} का मूड`
      : `Mood for ${formattedDate}`

  const displaySelectedText = isToday
    ? (locale === 'hi' ? 'आज चयनित' : 'Selected Today')
    : (locale === 'hi' ? 'चयनित' : 'Selected')

  const displayCommonText = locale === 'hi' ? 'सामान्य लक्षण' : 'Common Symptoms'

  return (
    <>
      {/* Symptoms Panel */}
      <div className="panel glass-dim">
        <h4>{displaySymptomsTitle}</h4>

        <div className="panel-subtitle">
          {displayCommonText}
        </div>

        <div className="symp-grid">
          {['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Nausea'].map(symptom => {
            const active = selectedSymptoms.includes(symptom)

            return (
              <button
                key={symptom}
                type="button"
                className={`symp-chip ${active ? 'active' : ''}`}
                onClick={() => toggleSymptom(symptom)}
              >
                <span className="chip-icon">
                  {symptomIcons[symptom]}
                </span>

                <span>{tSymp(symptom)}</span>
              </button>
            )
          })}
        </div>

        <div className="panel-divider" />

        <div className="selection-info">
          <span>{displaySelectedText}</span>

          <strong>
            {selectedSymptoms.length === 0
              ? 'None'
              : `${selectedSymptoms.length} Selected`}
          </strong>
        </div>
      </div>

      {/* Mood & Flow Panel */}
      <div className="panel glass-dim">
        <div className="panel-subtitle">
          {displayMoodTitle}
        </div>

        <div className="mood-row">
          {moods.map(mood => (
            <button
              key={mood.emoji}
              className={`mood-btn ${selectedMood === mood.emoji ? 'active' : ''
                }`}
              onClick={() => setSelectedMood(mood.emoji)}
            >
              <span className="emoji">
                {mood.emoji}
              </span>

              <span className="mood-name">
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flow-lbl">
          {t("flow")}
        </div>

        <div className="flow-scale">
          <span>{tFlow("Light")}</span>
          <span>{tFlow("Very Heavy")}</span>
        </div>

        <div className="flow-row">
          {[
            { id: "f1", label: "Light" },
            { id: "f2", label: "Medium" },
            { id: "f3", label: "Heavy" },
            { id: "f4", label: "Very Heavy" }
          ].map(flow => (
            <button
              key={flow.id}
              type="button"
              className={`flow-dot ${flow.id} ${selectedFlow === flow.id ? "active" : ""
                }`}
              onClick={() => setSelectedFlow(flow.id)}
              title={tFlow(flow.label)}
            />
          ))}
        </div>

        <button className="save-btn" onClick={handleSaveLog}>
          {t('save')}
        </button>
      </div>
    </>
  )
}
