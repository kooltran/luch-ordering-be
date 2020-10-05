const dayjs = require('dayjs')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

const getDateOfWeek = w => {
  const d = (w - 1) * 7 - 1
  const y = new Date().getFullYear()

  return new Date(y, 0, d)
}

exports.getStartDate = week => {
  return dayjs(getDateOfWeek(week)).startOf('day').day('1').week(week)
}

exports.getEndDate = week => {
  return dayjs(getDateOfWeek(week)).startOf('day').day('6').week(week)
}
