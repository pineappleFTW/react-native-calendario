
/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';
import Day from './Day';
import { getDayNames, isValidDate } from '../utils/date';
import { getDaysOfMonth } from '../utils';


class EmptyMonth extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { theme, name, height } = this.props;

    return <View style={[{
      height,
      justifyContent: 'center',
      alignItems: 'center'
    }, theme.emptyMonthContainerStyle]}>
        <Text style={[{ fontSize: 25, fontWeight: '300' }, theme.emptyMonthTextStyle]} allowFontScaling={false}>
          {name}
        </Text>
      </View>;
  }
}

class WeekColumns extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  renderWeekText = (day, i) => <View key={i} style={[{ flex: 1, alignItems: 'center' }, this.props.theme.weekColumnStyle]}>
      <Text allowFontScaling={false} style={this.props.theme.weekColumnTextStyle}>
        {day}
      </Text>
    </View>;

  render() {
    return <View style={[{ flexDirection: 'row' }, this.props.theme.weekColumnsContainerStyle]}>
        {this.props.days.map(this.renderWeekText)}
      </View>;
  }
}

class MonthTitle extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <Text allowFontScaling={false} style={[{ textAlign: 'center', paddingVertical: 10 }, this.props.theme.monthTitleTextStyle]}>
        {this.props.name}
      </Text>;
  }
}

export default class Month extends React.Component {
  static defaultProps = {
    renderDayContent: null,
    minDate: null,
    maxDate: null
  };

  shouldComponentUpdate(nextProps) {
    return this.props.month.isVisible !== nextProps.month.isVisible || this.props.startDate !== nextProps.startDate || this.props.endDate !== nextProps.endDate || this.props.extraData !== nextProps.extraData;
  }

  getDayList = () => {
    const {
      month: { monthNumber, year },
      startDate,
      endDate,
      firstDayMonday,
      minDate,
      maxDate,
      disableRange
    } = this.props;

    const min = minDate && isValidDate(new Date(minDate)) ? moment(minDate, 'YYYY-MM-DD').toDate() : null;
    const max = maxDate && isValidDate(new Date(maxDate)) ? moment(maxDate, 'YYYY-MM-DD').toDate() : null;

    return getDaysOfMonth(monthNumber, year, startDate, endDate, min, max, disableRange, firstDayMonday);
  };

  keyExtractor = item => item.id;

  renderWeek = (week, index) => <View key={index} style={{ flexDirection: 'row' }}>
      {week.map(this.renderDay)}
    </View>;

  renderDay = (day, index) => <Day key={index} item={day} onPress={this.props.onPress} theme={this.props.theme} renderDayContent={this.props.renderDayContent} disabled={this.props.disabled} />;

  render() {
    const {
      month: { name, isVisible },
      showWeekdays,
      showMonthTitle,
      firstDayMonday,
      theme,
      dayNames,
      height,
      locale
    } = this.props;

    if (!isVisible) {
      return <EmptyMonth name={name} theme={theme} height={height} />;
    }

    const DAY_NAMES = dayNames.length ? dayNames : getDayNames(locale, firstDayMonday);
    const days = this.getDayList();
    const weeks = [];

    while (days.length) {
      weeks.push(days.splice(0, 7));
    }

    return <View style={{ height }}>
        {showMonthTitle && <MonthTitle name={name} theme={theme} />}
        {showWeekdays && <WeekColumns days={DAY_NAMES} theme={theme} />}
        {weeks.map(this.renderWeek)}
      </View>;
  }
}