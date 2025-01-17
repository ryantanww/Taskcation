import React, { useState } from "react";
import {
    Text,
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
    StyleSheet,
    Image
} from "react-native";
import { CheckBox } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from '@react-navigation/native';