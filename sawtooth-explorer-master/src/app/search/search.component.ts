import { Component, OnInit, OnDestroy, Input,
  HostListener } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  /**
   * @param http {Http} - service for making HTTP requests
   */

  constructor(public http:Http) { }

// list of state deltas from addresses subscribed to
  @Input()
  states: object[];

  // observable for tracking changes to state deltas sent from websocket
  statesObservable: Subject<object>;

  // list of addresses to monitor for state delta changes
  addresses: string[];

  // model for user to add new address to list of monitored addresses
  newAddress: string;

  // web socket connection used to subscribe to state delta changes
  webSocket: WebSocket;

  // 트랜잭션 패밀리의 주소 - 
  prefixes: string[];

  webSocketUrl = environment.apiURL.replace(/^(https?):\/\//, 'ws:') + '/subscriptions';

  ngOnInit() {
    this.states = [];
    this.addresses = [];
    this.prefixes = [];
  }

  ngOnDestroy() {
    this.closeWebsocket();
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event) {
    // make sure websocket is closed if the page closes
    this.closeWebsocket();
  }

    /**
   * Add a address to the list of addresses monitored for state deltas.
   * @param address {string} - address to be added to the list of
   *   addresses subscribed to
   */
  addAddress(address: string) {
    // if no address is sent, no need to make any changes
    if (!address) return;

    this.addresses.push(address);
    this.newAddress = '';

    // restart state delta subscription with newly added address included
    this.resetWebsocket(this.addresses);
  }

  /**
   * Removes a address from the list of addresses monitored for state
   * deltas.
   * @param index {number} - the index of the address in the list of
   *   addresses subscribed to
   */
  removeAddress(index: number) {
    // only remove address from existing address list at valid index
    if (!this.addresses || this.addresses.length <= index) return;

    // check index bounds
    if (index < 0 || index >= this.addresses.length) return;

    // remove item at index
    this.addresses.splice(index, 1);

    // restart state delta subscription with removed address not included
    this.resetWebsocket(this.addresses);
  }

  /**
   * Reset any existing websocket connection with new subscription information.
   * @param addresses {string[]} - list of addresses to subscribe to via
   *     websocket
   */
  resetWebsocket(addresses: string[]) {
    // reset websocket connection
    this.closeWebsocket();
    this.openWebsocket(this.addresses);
  }

  /**
   * Subscribes to state changes made to specific address spaces.
   * @param addresses {number} - list of addresses to subscribe to via
   *   websocket
   */
  openWebsocket(addresses: string[]): void {
    if (!addresses || !addresses.length) return;

    // subscribe to state changes from specified addresses
    this.webSocket = new WebSocket(this.webSocketUrl);
    this.webSocket.onopen = () => {
      this.webSocket.send(JSON.stringify({
        'action': 'subscribe',
        'address_prefixes': addresses // 어드레스를 줄게. 구독할테니
      }))
    }

    this.getblockWebsocket();

    this.webSocket.onmessage = (message) => {
      let newStates = this.parseDeltaSubscriptionMessage(message);
      if (newStates && newStates.length) {
        this.states = this.states.concat(newStates);
      }
    }
  }

  /**
   * Parses response from state delta subscription.
   * @param message {Object} - response sent from websocket subscription
   * @return {Object[]} - list of summaries of all state changes included in
   *   original message
   */
  parseDeltaSubscriptionMessage(message: object): object[] {
    // list of parsed state delta data from subscription message
    let stateChanges = [];

    // message needs to include data
    if (!message['data']) return stateChanges;

    // data from the message
    let messageData = JSON.parse(message['data']);
    console.log(messageData);
    let stateChangeData = messageData['state_changes'];

    // if no state changes are included in the result, no need to report it
    if (!stateChangeData) return stateChanges;

    // compile summary of information for each state delta included in
    // subscription message
    stateChangeData.forEach(change => {
      stateChanges.push({
        block_id: messageData['block_id'],
        block_num: messageData['block_num'],
        previous_block_id: messageData['previous_block_id'],
        payload: change
      } as object);
    });

    return stateChanges;
  }

  /**
   * Unsubscribes to state changes.
   * 웹소켓 연결을 끊습니다.
   */
  closeWebsocket(): void {
    if (this.webSocket) {
      this.webSocket.send(JSON.stringify({
        'action': 'unsubscribe'
      }));
      this.webSocket.close();
    }
    this.webSocket = null;
  }

  /**
   * Serch the submit block ID - state deltas & block commit Event.
   * 블록 아이디를 이용해 이전 블록의 이벤트를 불러옵니다. 
   * 매개변수로 주어야 할 것 : 검색하고자 하는 블록의 아이디
   */

  getblockWebsocket(): void {
    if (this.webSocket) {
      this.webSocket.send(JSON.stringify({
        'action': 'get_block_deltas',
        'block_id': '60a956ff931dc36483ba6bd87ef7b92f85fcbe2754a0e8471d8d5a6cbce240e65082c674a2bc5075e1744f179f6e58a225665b1911d0b56b8f5b00e5e9a28124',
        'address_prefixes': ['000000']
      }));
    }
    this.webSocket = null;
  }

}
