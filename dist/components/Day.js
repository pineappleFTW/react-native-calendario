
/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  activeDate: {
    backgroundColor: '#3b5998'
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    marginVertical: 5,
    paddingVertical: 10
  },
  endDate: {
    borderBottomRightRadius: 60,
    borderTopRightRadius: 60
  },
  startDate: {
    borderBottomLeftRadius: 60,
    borderTopLeftRadius: 60
  }
});

class NonTouchableDay extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.isActive !== nextProps.isActive;
  }

  render() {
    const {
      isMonthDate,
      isActive,
      isOutOfRange,
      theme,
      date,
      isToday
    } = this.props;

    return <View style={[styles.container, theme.dayContainerStyle, theme.nonTouchableDayContainerStyle, isToday && !isActive ? theme.todayContainerStyle : {}, isActive ? styles.activeDate : {}, isActive ? theme.activeDayContainerStyle : {}, isOutOfRange ? theme.dayOutOfRangeContainerStyle : {}]}>
        <Text style={[{ color: '#d3d3d3' }, theme.nonTouchableDayTextStyle, isMonthDate ? theme.nonTouchableLastMonthDayTextStyle : {}, isToday ? theme.todayTextStyle : {}, isOutOfRange ? theme.dayOutOfRangeTextStyle : {}]}>
          {!isActive && date.getDate()}
        </Text>
      </View>;
  }
}

export default class Day extends React.Component {
  static defaultProps = {
    renderDayContent: null
  };

  shouldComponentUpdate(nextProps) {
    return this.props.item.isActive !== nextProps.item.isActive || this.props.item.isStartDate !== nextProps.item.isStartDate || this.props.item.isEndDate !== nextProps.item.isEndDate || this.props.renderDayContent !== nextProps.renderDayContent;
  }

  handlePress = () => this.props.onPress(this.props.item.date);

  render() {
    const {
      item: {
        date,
        isVisible,
        isActive,
        isStartDate,
        isEndDate,
        isMonthDate,
        isOutOfRange,
        isToday
      },
      theme
    } = this.props;

    if (!isVisible) {
      return <NonTouchableDay isActive={isActive} date={date} theme={theme} isMonthDate={isMonthDate} isOutOfRange={isOutOfRange} isToday={isToday} />;
    }

    return <TouchableOpacity style={[styles.container, theme.dayContainerStyle, isToday && !isActive ? theme.todayContainerStyle : {}, isActive ? styles.activeDate : {}, isActive ? theme.activeDayContainerStyle : {}, isStartDate ? styles.startDate : {}, isStartDate ? theme.startDateContainerStyle : {}, isEndDate ? styles.endDate : {}, isEndDate ? theme.endDateContainerStyle : {}]} disabled={this.props.disabled ? this.props.disabled(this.props.item) : false} onPress={this.handlePress}>
        {this.props.renderDayContent ? this.props.renderDayContent(this.props.item) : <Text style={[{ color: isActive ? 'white' : 'black' }, theme.dayTextStyle, isToday ? theme.todayTextStyle : {}, isActive ? theme.activeDayTextStyle : {}]}>
              {date.getDate()}
            </Text>}
      </TouchableOpacity>;
  }
}