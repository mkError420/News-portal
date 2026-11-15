import { useState, useEffect } from 'react'
import { Vote, CheckCircle2, BarChart2, Loader2, RotateCcw } from 'lucide-react'
import { api } from '../api.js'
import { toBengaliNumber } from '../utils.js'

export default function ReaderPollWidget({ lang = 'bn', initialPoll = null, onVote = null }) {
  const [poll, setPoll] = useState(initialPoll)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVotedOption, setUserVotedOption] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(!initialPoll)

  // Sync when initialPoll updates from parent
  useEffect(() => {
    if (initialPoll && initialPoll.id) {
      setPoll(initialPoll)
      setLoading(false)
    }
  }, [initialPoll])

  // Fetch latest active poll from backend
  const fetchPoll = async () => {
    try {
      const data = await api.getPoll()
      if (data && data.id) {
        setPoll(data)
        // Check if user already voted on this specific poll
        const votedOptionId = localStorage.getItem(`prothom_poll_voted_${data.id}`)
        if (votedOptionId) {
          setHasVoted(true)
          setUserVotedOption(votedOptionId)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch reader poll:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPoll()
  }, [])

  // Check voted status if initialPoll was passed or poll updated
  useEffect(() => {
    if (poll?.id) {
      const votedOptionId = localStorage.getItem(`prothom_poll_voted_${poll.id}`)
      if (votedOptionId) {
        setHasVoted(true)
        setUserVotedOption(votedOptionId)
      } else {
        setHasVoted(false)
        setUserVotedOption(null)
      }
    }
  }, [poll?.id])

  const handleVoteSubmit = async (e) => {
    e.preventDefault()
    if (!selectedOption || !poll?.id || isSubmitting) return

    setIsSubmitting(true)
    try {
      const updated = await api.votePoll(poll.id, selectedOption)
      if (updated) {
        setPoll(updated)
        onVote?.(updated)
      }
      setHasVoted(true)
      setUserVotedOption(selectedOption)
      localStorage.setItem(`prothom_poll_voted_${poll.id}`, String(selectedOption))
    } catch (err) {
      alert(lang === 'bn' ? 'ভোট গ্রহণে সমস্যা হয়েছে: ' + (err.message || 'Error') : 'Voting error: ' + (err.message || 'Error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !poll) {
    return (
      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (!poll) return null

  const isClosed = poll.status === 'closed'
  const isViewResults = hasVoted || showResults || isClosed
  const totalVotes = Number(poll.total_votes) || 0
  const question = (lang === 'bn' ? (poll.question_bn || poll.question_en) : (poll.question_en || poll.question_bn)) || ''
  const options = Array.isArray(poll.options) ? poll.options : []

  // Color variants for result bars
  const barColors = [
    'bg-emerald-600',
    'bg-[#e30613]',
    'bg-amber-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-gray-500',
  ]

  return (
    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-red-600">
          <Vote size={18} />
          <h4 className="font-bold text-sm text-gray-900">
            {lang === 'bn' ? 'পাঠক জরিপ' : 'Reader Poll'}
          </h4>
        </div>
        {isClosed ? (
          <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {lang === 'bn' ? 'জরিপ সমাপ্ত' : 'Closed'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {lang === 'bn' ? 'লাইভ' : 'Live'}
          </span>
        )}
      </div>

      {/* Poll Question */}
      <p className="text-xs font-semibold text-gray-800 leading-relaxed mb-3">
        {question}
      </p>

      {/* Voting Form */}
      {!isViewResults ? (
        <form onSubmit={handleVoteSubmit} className="space-y-2 text-xs">
          {options.map((opt, i) => {
            const label = lang === 'bn' ? (opt.label_bn || opt.label_en) : (opt.label_en || opt.label_bn)
            const isSelected = selectedOption === opt.id
            return (
              <label
                key={opt.id || i}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  isSelected ? 'border-red-400 bg-red-50/50 text-red-900 font-semibold' : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="reader_poll"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => setSelectedOption(opt.id)}
                  className="text-[#e30613] focus:ring-[#e30613]"
                />
                <span className="text-xs">{label}</span>
              </label>
            )
          })}

          <button
            type="submit"
            disabled={!selectedOption || isSubmitting}
            className="w-full mt-2.5 bg-[#e30613] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded transition-colors text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{lang === 'bn' ? 'ভোট জমা হচ্ছে...' : 'Submitting...'}</span>
              </>
            ) : (
              <span>{lang === 'bn' ? 'ভোট দিন' : 'Submit Vote'}</span>
            )}
          </button>

          {/* View results toggle */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowResults(true)}
              className="text-[11px] text-gray-500 hover:text-red-600 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <BarChart2 size={12} />
              <span>{lang === 'bn' ? 'বর্তমান ফলাফল দেখুন' : 'View Current Results'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Results View */
        <div className="space-y-2.5 text-xs">
          {hasVoted && (
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded font-semibold flex items-center gap-1.5 text-xs border border-emerald-100">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>{lang === 'bn' ? 'আপনার মতামত সফলভাবে গৃহীত হয়েছে!' : 'Thank you! Your vote has been recorded.'}</span>
            </div>
          )}

          {/* Option Percentage Bars */}
          <div className="space-y-2 pt-1">
            {options.map((opt, idx) => {
              const label = lang === 'bn' ? (opt.label_bn || opt.label_en) : (opt.label_en || opt.label_bn)
              const votes = Number(opt.votes) || 0
              const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 1000) / 10 : 0
              const isUserChoice = userVotedOption === opt.id
              const barColor = barColors[idx % barColors.length]

              return (
                <div key={opt.id || idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`flex items-center gap-1 ${isUserChoice ? 'font-bold text-[#e30613]' : 'text-gray-700'}`}>
                      {label}
                      {isUserChoice && (
                        <span className="text-[10px] bg-red-100 text-[#e30613] px-1 rounded font-bold">
                          {lang === 'bn' ? 'আপনার ভোট' : 'Your Choice'}
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-gray-900">
                      {lang === 'bn' ? toBengaliNumber(percent) : percent}%
                      <span className="text-[10px] text-gray-400 font-normal ml-1">
                        ({lang === 'bn' ? toBengaliNumber(votes) : votes})
                      </span>
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(100, Math.max(percent > 0 ? percent : 2, 0))}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total Votes Footer & Back Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>
              {lang === 'bn'
                ? `মোট ভোট: ${toBengaliNumber(totalVotes)} টি`
                : `Total votes: ${totalVotes}`}
            </span>

            {!hasVoted && !isClosed && (
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="text-[#e30613] hover:underline font-bold inline-flex items-center gap-0.5"
              >
                <RotateCcw size={11} />
                <span>{lang === 'bn' ? 'ভোট দিন' : 'Vote Now'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
