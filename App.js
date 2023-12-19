import React, { Component } from 'react';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,Button, TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const playlist = [
  {
    title: 'People Watching',
    artist: 'Keller Williams',
    album: 'Keller Williams Live at The Westcott Theater on 2012-09-22',
    uri: 'https://ia800308.us.archive.org/7/items/kwilliams2012-09-22.at853.flac16/kwilliams2012-09-22at853.t16.mp3'
  },
  {
    title: 'Hunted By A Freak',
    artist: 'Mogwai',
    album: 'Mogwai Live at Ancienne Belgique on 2017-10-20',
    uri: 'https://ia601509.us.archive.org/17/items/mogwai2017-10-20.brussels.fm/Mogwai2017-10-20Brussels-07.mp3'
  },
  {
    title: 'Nervous Tic Motion of the Head to the Left',
    artist: 'Andrew Bird',
    album: 'Andrew Bird Live at Rio Theater on 2011-01-28',
    uri: 'https://ia800503.us.archive.org/8/items/andrewbird2011-01-28.early.dr7.flac16/andrewbird2011-01-28.early.t07.mp3'
  }
];

export default class App extends Component {
  
  constructor(props) {
  super(props);
  this.state = {
    isPlaying: false,
    playbackInstance: null,
    volume: 1.0,
    currentTrackIndex: 0,
    isBuffering: false,
    picker1: '1 Star',
    picker2: '1 Star',
    picker3: '1 Star',
    loadedValue: null,  
  };
}

  async componentDidMount() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playThroughEarpieceAndroid: true,  
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true
  });
    this.loadAudio();
  }

  async loadAudio() {
    const playbackInstance = new Audio.Sound();
    const source = {
      uri: playlist[this.state.currentTrackIndex].uri
    };
    const status = {
      shouldPlay: this.state.isPlaying,
      volume: this.state.volume,
    };
    playbackInstance.setOnPlaybackStatusUpdate(
      this.onPlaybackStatusUpdate
    );
    await playbackInstance.loadAsync(source, status, false);
    this.setState({
      playbackInstance
    });
  }

  onPlaybackStatusUpdate = (status) => {
    this.setState({
      isBuffering: status.isBuffering
    });
  }

  handlePlayPause = async () => {
    const { isPlaying, playbackInstance } = this.state;
    isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync();
    this.setState({
      isPlaying: !isPlaying
    });
  }

  handlePreviousTrack = async () => {
    let { playbackInstance, currentTrackIndex } = this.state;
    if (playbackInstance) {
      await playbackInstance.unloadAsync();
      currentTrackIndex === 0 ? currentTrackIndex = playlist.length - 1 : currentTrackIndex -= 1;
      this.setState({
        currentTrackIndex
      });
      this.loadAudio();
    }
  }

  handleNextTrack = async () => {
    let { playbackInstance, currentTrackIndex } = this.state;
    if (playbackInstance) {
      await playbackInstance.unloadAsync();
      currentTrackIndex < playlist.length - 1 ? currentTrackIndex+=1 : currentTrackIndex = 0;
      this.setState({
        currentTrackIndex
      });
      this.loadAudio();
    }
  }
  
  onSaveData = async () => {
    try {
      const data = `${this.state.picker1}, ${this.state.picker2}, ${this.state.picker3}`;
      await AsyncStorage.setItem('pickers', data);
      alert('Data saved successfully!');
    } catch (e) {
      alert('Failed to save data.');
    }
  };

  onLoadData = async () => {
    try {
      const value = await AsyncStorage.getItem('pickers');
      if (value !== null) {
        const [p1, p2, p3] = value.split(', ');
        this.setState({
          picker1: p1,
          picker2: p2,
          picker3: p3,
          loadedValue: value,
        });
        alert('Data loaded successfully!');
      } else {
        alert('No data found.');
      }
    } catch (e) {
      alert('Failed to load data.');
    }
  };
  
  render() {
    const { picker1, picker2, picker3, loadedValue } = this.state;
    const currentSongIndex = this.state.currentTrackIndex;
    return (
      <View style={styles.container}>
        <Text style={[styles.largeText, styles.buffer]}>
          {this.state.isBuffering && this.state.isPlaying ? 'Buffering...' : null}
        </Text>
        {this.renderSongInfo()}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.control} onPress={this.handlePreviousTrack}>
            <Feather name="skip-back" size={32} color="#40E0D0"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.control} onPress={this.handlePlayPause}>
            {this.state.isPlaying ?
              <Feather name="pause" size={32} color="#9FE2BF"/> :
              <Feather name="play" size={32} color="#9FE2BF"/>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.control} onPress={this.handleNextTrack}>
            <Feather name="skip-forward" size={32} color="#40E0D0"/>
          </TouchableOpacity>
        </View>
        {playlist.map((song, index) => (
    <View key={song.title} style={{ display: this.state.currentTrackIndex === index ? 'flex' : 'none' }}>
    <Text style={[styles.smallText,{padding:5, backgroundColor : '#40E0D0'},{ marginLeft: index === 0 ? -180 : 'auto', marginRight: index === 2 ? -180 : 'auto' }]}>{`Rate Song`}</Text>
    <Picker
      style={[styles.picker,{ marginLeft: index === 0 ? -170 : 'auto', marginRight: index === 2 ? -170 : 'auto' }]}
      selectedValue={this.state[`picker${index + 1}`]}
      onValueChange={(itemValue, itemIndex) => this.setState({ [`picker${index + 1}`]: itemValue })}>
      <Picker.Item label="1 Star" value="1 Star" />
      <Picker.Item label="2 Stars" value="2 Stars" />
      <Picker.Item label="3 Stars" value="3 Stars" />
      <Picker.Item label="4 Stars" value="4 Stars" />
      <Picker.Item label="5 Stars" value="5 Stars" />
    </Picker>
    </View>
    ))}
    <View style={{padding:150}}>
          <Button title="Save Data" onPress={this.onSaveData} />
          <Button title="Load Data" onPress={this.onLoadData} />
          {loadedValue !== null && (
            <View>
              <TextInput
                style={{ backgroundColor: '#eee', padding: 22, width: 250, height: 195, marginLeft: 10 }}
                value={`People Watching : ${picker1} \nHunted By A Freak: ${picker2} \nNervous Tic Motion of the Head to the Left: ${picker3}`}
                editable={false}
                multiline={true}
              />
            </View>
          )}
          {loadedValue === null &&
            (
              <TextInput
                style={{ backgroundColor: '#eee', padding: 10, width: 400, height: 75, marginLeft: 10 }}
                value=""
                editable={false}
              />
            )
          }
        </View>
      </View>
    );
    
  }
  renderSongInfo() {
    const { playbackInstance, currentTrackIndex } = this.state;
    return playbackInstance ?
    <View style={styles.trackInfo}>
      <Text style={[styles.trackInfoText, styles.largeText]}>
        {playlist[currentTrackIndex].title}
      </Text>
      <Text style={[styles.trackInfoText, styles.smallText]}>
        {playlist[currentTrackIndex].artist}
      </Text>
      <Text style={[styles.trackInfoText, styles.smallText]}>
        {playlist[currentTrackIndex].album}
      </Text>
    </View>: null; 
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8C471',
      alignItems: 'center',
      justifyContent: 'center',
    },
    picker:{
      width: 150,
      height:100,
    },

    trackInfo: {
      padding: 40,
      alignItems: 'center',
    },
    trackInfoText: {
      textAlign: 'center',
      flexWrap: 'wrap',
      color: '#FFF',
    },
    largeText: {
      fontSize: 24,
    },
    smallText: {
      fontSize: 17,
    },
    controls: {
      flexDirection: 'row',
      marginTop: 20,
    },
    control: {
      marginHorizontal: 20,
    },
    buffer: {
      marginBottom: 20,
    },
});
  