import * as React from 'react';
import { FlatList } from 'react-native';
import moment from 'moment';

import Month from './components/Month';
import { getMonthsList, viewableItemsChanged } from './utils';
import { isValidDate } from './utils/date';


const NUMBER_OF_MONTHS = 12;
const MONTH_HEIGHT = 370;

const DIFF_VISIBLE = 1;

const VIEWABILITY_CONFIG = {
  waitForInteraction: true,
  itemVisiblePercentThreshold: 10,
  minimumViewTime: 300
};

function visibleMonthsChanged(oldMonths, newMonths) {
  for (let i = 0; i < oldMonths.length; i++) {
    if (newMonths[i].isVisible !== oldMonths[i].isVisible) {
      return true;
    }
  }

  return false;
}

export default class Calendar extends React.Component {
  static defaultProps = {
    numberOfMonths: NUMBER_OF_MONTHS,
    startingMonth: moment().format('YYYY-MM-DD'),
    initialListSize: 2,
    showWeekdays: true,
    showMonthTitle: true,
    theme: {},
    locale: 'en',
    monthNames: [],
    dayNames: [],
    disableRange: false,
    firstDayMonday: false,
    monthHeight: MONTH_HEIGHT,
    minDate: null,
    maxDate: null,
    startDate: null,
    endDate: null,
    renderDayContent: null,
    calendarListRef: null
  };

  state = {
    months: [],
    initialListSize: 2,
    firstViewableIndex: 0,
    lastViewableIndex: 0,
    initialScrollIndex: 0,
    startDate: null,
    endDate: null
  };

  componentWillMount() {
    const {
      initialListSize,
      numberOfMonths,
      startingMonth,
      startDate,
      endDate,
      locale,
      monthNames
    } = this.props;

    const firstMonthToRender = startingMonth && isValidDate(new Date(startingMonth)) ? moment(startingMonth, 'YYYY-MM-DD').toDate() : moment().toDate();

    let start = startDate && isValidDate(new Date(startDate)) ? moment(startDate, 'YYYY-MM-DD').toDate() : null;
    const end = endDate && isValidDate(new Date(endDate)) ? moment(endDate, 'YYYY-MM-DD').toDate() : null;

    start = moment(firstMonthToRender).add(numberOfMonths, 'months').toDate() < start ? null : start;

    const months = getMonthsList(firstMonthToRender, numberOfMonths, initialListSize + DIFF_VISIBLE, start, locale, monthNames);

    let firstMonthIndex = 0;
    if (start) {
      const firstMonth = months.find(m => !!start && m.monthNumber === start.getMonth() && m.year === start.getFullYear());

      firstMonthIndex = months.indexOf(firstMonth) || 0;
    }

    this.setState({
      initialScrollIndex: firstMonthIndex,
      initialListSize,
      months,
      startDate: start,
      endDate: end
    });
  }

  componentWillReceiveProps(nextProps) {
    const { startDate } = this.state;
    const nextStartDate = nextProps.startDate && isValidDate(new Date(nextProps.startDate)) ? moment(nextProps.startDate, 'YYYY-MM-DD').toDate() : null;
    const endDate = nextProps.endDate && isValidDate(new Date(nextProps.endDate)) ? moment(nextProps.endDate, 'YYYY-MM-DD').toDate() : null;

    if (startDate !== nextStartDate || this.state.endDate !== endDate) {
      this.setState({
        startDate: nextStartDate,
        endDate
      }, () => {
        if (this.listReference && nextStartDate && startDate !== nextStartDate) {
          const { months } = this.state;
          const index = months.findIndex(m => m.monthNumber === nextStartDate.getMonth() && m.year === nextStartDate.getFullYear());

          if (index !== -1) {
            const nextVisibleMonths = months.map((month, i) => ({
              ...month,
              isVisible: i + DIFF_VISIBLE >= index || i - DIFF_VISIBLE <= index
            }));

            this.listReference.scrollToIndex({
              index
            });
            this.setState({
              months: nextVisibleMonths
            });
          }
        }
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.months.length !== nextState.months.length || visibleMonthsChanged(this.state.months, nextState.months) || this.state.startDate !== nextState.startDate || this.state.endDate !== nextState.endDate || this.props.renderDayContent !== nextProps.renderDayContent;
  }

  getItemLayout = (data, index) => ({
    length: this.props.monthHeight,
    offset: this.props.monthHeight * index,
    index
  });

  keyExtractor = item => String(item.id);

  handleViewableItemsChange = info => {
    let { firstViewableIndex, lastViewableIndex } = this.state;
    if (viewableItemsChanged(firstViewableIndex, lastViewableIndex, info)) {
      if (this.props.viewableItemsChanged) {
        this.props.viewableItemsChanged(info);
      }

      const firstItemVisible = info.viewableItems[0];
      const lastVisibleItem = info.viewableItems[info.viewableItems.length - 1];
      firstViewableIndex = firstItemVisible ? firstItemVisible.index : 0;
      lastViewableIndex = lastVisibleItem ? lastVisibleItem.index : this.state.lastViewableIndex;

      this.setState(state => {
        const months = state.months.map((month, i) => {
          const isVisible = i >= firstViewableIndex - DIFF_VISIBLE && i <= lastViewableIndex + DIFF_VISIBLE + 1;

          return {
            ...month,
            isVisible
          };
        });

        return {
          firstViewableIndex,
          lastViewableIndex,
          months
        };
      });
    }
  };

  handlePressDay = date => {
    const newRange = {};

    if (this.props.disableRange) {
      newRange.startDate = date;
      newRange.endDate = date;
    } else if (this.state.startDate) {
      if (this.state.endDate) {
        newRange.startDate = date;
        newRange.endDate = null;
      } else if (date < this.state.startDate) {
        newRange.startDate = date;
        newRange.endDate = null;
      } else if (date > this.state.startDate) {
        let isPeriodBlock = false;
        for (let i = new Date(this.state.startDate); i <= date; i.setDate(i.getDate() + 1)) {
          const data = { date: i };

          if (this.props.disabled(data)) {
            isPeriodBlock = true;
            break;
          }
        }

        if (isPeriodBlock) {
          newRange.startDate = date;
          newRange.endDate = null;
        } else {
          newRange.startDate = this.state.startDate;
          newRange.endDate = date;
        }
      } else {
        newRange.startDate = date;
        newRange.endDate = date;
      }
    } else {
      newRange.startDate = date;
      newRange.endDate = null;
    }

    this.setState({
      ...newRange
    }, () => this.props.onChange(newRange));
  };

  listRef = ref => {
    this.listReference = ref;
  };

  // eslint-disable-next-line
  renderMonth = ({ item }) => <Month onPress={this.handlePressDay} month={item} theme={this.props.theme} showWeekdays={this.props.showWeekdays} showMonthTitle={this.props.showMonthTitle} locale={this.props.locale} dayNames={this.props.dayNames} height={this.props.monthHeight} firstDayMonday={this.props.firstDayMonday} renderDayContent={this.props.renderDayContent} disabled={this.props.disabled} minDate={this.props.minDate} maxDate={this.props.maxDate} startDate={this.state.startDate} endDate={this.state.endDate} disableRange={this.props.disableRange} extraData={this.props.extraData} />;

  render() {
    return <FlatList getItemLayout={this.getItemLayout} initialScrollIndex={this.state.initialScrollIndex} viewabilityConfig={VIEWABILITY_CONFIG} removeClippedSubviews onViewableItemsChanged={this.handleViewableItemsChange} initialNumToRender={this.state.initialListSize} keyExtractor={this.keyExtractor} renderItem={this.renderMonth} extraData={this.props.extraData || this.state} data={this.state.months} ref={this.props.calendarListRef || this.listRef} />;
  }
}