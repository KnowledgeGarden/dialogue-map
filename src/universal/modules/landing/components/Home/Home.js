import React, {Component} from 'react';
import Footer from 'universal/components/Footer/Footer';
import Header from '../Header/Header';

export default class Home extends Component {
  render() {
    return (
      <div id="home">
        <Header/>
        <Footer/>
      </div>
    );
  }
}
