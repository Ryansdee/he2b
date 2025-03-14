// app/(tabs)/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from './HomePage';
import StudentsPage from './StudentsPage';
import TeacherPage from './TeacherPage';
import NewsPage from './NewsPage';
import ProfilePage from './ProfilePage';

const Tab = createBottomTabNavigator();

const TabLayout = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
      <Tab.Screen name="Students" component={StudentsPage} />
      <Tab.Screen name="Teachers" component={TeacherPage} />
      <Tab.Screen name="News" component={NewsPage} />
    </Tab.Navigator>
  );
};

export default TabLayout;
