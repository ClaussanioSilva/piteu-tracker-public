import { useNavigate, useSearchParams } from "react-router-dom"
import { Calendar as DatePicker } from "@/components/ui/calendar"

const parseDateParam = (value: string | null) => {
  if (!value) return new Date()

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return new Date()

  return new Date(year, month - 1, day)
}

const formatDateParam = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function DateCalendar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const selectedDate = parseDateParam(searchParams.get("date"))
  const todayDateString = formatDateParam(new Date())

  const handleSelect = (date?: Date) => {
    if (!date) return

    const dateParam = formatDateParam(date)
    navigate(dateParam === todayDateString ? "/" : `/?date=${dateParam}`)
  }

  return (
    <div className="animate-fade-in min-h-[calc(100vh-7rem)] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] bg-background p-2 md:rounded-[2.5rem] md:p-4">
          <div className="mb-3 rounded-[1.5rem] bg-card px-4 py-4 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Selecionar data
              </p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {selectedDate.toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] bg-card p-2">
            <DatePicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={{ after: new Date() }}
              className="w-full rounded-[1.5rem] bg-transparent p-2"
              classNames={{
                months: "flex w-full",
                month: "w-full space-y-4",
                caption: "flex justify-center pt-2 pb-4 relative items-center",
                caption_label: "text-base font-semibold text-foreground",
                nav_button: "h-9 w-9 rounded-xl border border-border/50 bg-background/70 p-0 opacity-100 hover:bg-accent",
                table: "w-full border-collapse",
                head_row: "flex w-full justify-between",
                head_cell: "w-10 text-[0.72rem] font-medium uppercase tracking-wide text-muted-foreground",
                row: "mt-2 flex w-full justify-between",
                cell: "h-10 w-10 p-0 text-sm",
                day: "h-10 w-10 rounded-2xl p-0 text-sm font-medium hover:bg-accent hover:text-foreground",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md",
                day_today: "bg-primary/10 text-primary",
                day_outside: "text-muted-foreground/30 opacity-50",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
