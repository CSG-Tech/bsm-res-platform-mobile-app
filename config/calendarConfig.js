import { LocaleConfig } from 'react-native-calendars';
export const configureCalendar = () => {
LocaleConfig.locales['ar'] = {
monthNames: [
'يناير',
'فبراير',
'مارس',
'أبريل',
'مايو',
'يونيو',
'يوليو',
'أغسطس',
'سبتمبر',
'أكتوبر',
'نوفمبر',
'ديسمبر'
],
monthNamesShort: ['ينا.', 'فبر.', 'مار.', 'أبر.', 'ماي.', 'يون.', 'يول.', 'أغس.', 'سبت.', 'أكت.', 'نوف.', 'ديس.'],
dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
dayNamesShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
today: "اليوم"
};
LocaleConfig.locales['en'] = {
monthNames: [
'January',
'February',
'March',
'April',
'May',
'June',
'July',
'August',
'September',
'October',
'November',
'December'
],
monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
today: "Today"
};
};
export const setCalendarLanguage = (lang) => {
if (lang === 'ar') {
LocaleConfig.defaultLocale = 'ar';
} else {
LocaleConfig.defaultLocale = 'en';
}
}