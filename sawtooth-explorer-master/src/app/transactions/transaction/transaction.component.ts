/**
 * Copyright 2017 PokitDok, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ------------------------------------------------------------------------------
 */

import { Component, Input, OnInit, OnChanges, Injectable } from '@angular/core';
import { Base64DecodePipe } from '../../pipes/base64-decode/base64-decode.pipe'; // 디코더 파이프 
import { UIAceDataTransformPipe } from
  '../../pipes/ui-ace-data-transform/ui-ace-data-transform.pipe'; // ace 데이터 형태로 변환하는 파이프
/**
 * A component that formats all the data associated with a transaction for
 * display.
 */
@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: [
    './transaction.component.scss',
    '../../../styles/shared/_explorer-detail.scss'
  ],
  providers: [Base64DecodePipe, UIAceDataTransformPipe]
})
export class TransactionComponent implements OnInit, OnChanges {

  // data representing the transaction
  @Input() data = {};

  // data stringified for Angular UI Ace to display
  // 데이터를 스트링화함 
  payloadJSON = '{}';

  // set default UI Ace display to show as plain text (no syntax highlighting)
  // 에이스모드 : 텍스트, 코드가 아닌 일반 구문이라는 뜻. 
  aceMode = 'text';

  /**
   * @param uiAceDataTransformPipe {UIAceDataTransformPipe} - used to transform
   * data into a format displayable by Angular UI Ace
   * Angular UI Ace로 표시 할 수있는 형식의 데이터로 변환하는 데 사용됨.
   */
  constructor(private uiAceDataTransformPipe: UIAceDataTransformPipe) {}

  // ngOnInit needed in addition to ngOnChanges because when this view is
  // ngOnChanges 이외에 ngOnInit이 필요합니다. 왜냐하면이 뷰가
  // dynamically loaded as a component, ngOnInit fires, but ngOnChanges doesn't.
  // 동적 로드될때 ngOnInit은 발생하지만 ngOnChanges는 그렇지 않기 때문입니다. 
  ngOnInit() {
    // format payload for Angular UI Ace
    // 앵귤러 UI 에이스의 형식 페이로드
    this.updatePayloadData(this.data['payload']);
  }

  ngOnChanges() {
    // format payload for Angular UI Ace
    this.updatePayloadData(this.data['payload']); // 만약 변화가 일어났다면 - 변형된 데이터를 가져옵니다. 
  }

  /**
   * Updates transaction payload so it can be displayed in UI Ace
   * 트랜잭션 페이로드를 에이스에 표시할 수 있도록 업데이트합니다. 
   * @param payloadData - data representing the payload within a transaction : 트랜잭션 내의 페이로드를 나타내는 데이터
   */
  updatePayloadData(payloadData: any): void {
    // format payload for Angular UI Ace
    let formatRes = this.getFormatData(payloadData);
    this.payloadJSON = formatRes.data;
    this.aceMode = formatRes.aceDisplayMode;
  }

  /**
   * Gets formatting information needed for a transaction payload to be, 트랜잭션 페이로드에 필요한 형식 정보를 가져옵니다.
   * displayed in string form. 문자열 형식으로 표시.
   * @param payloadData - data representing the payload within a transaction, 트랜잭션 내의 페이로드를 나타내는 데이터
   * @returns {object} formatted transaction payload data, 오브젝트 형식의 트랜잭션 페이로드 데이터
   */
  getFormatData(payloadData: any): any {
    let formatResult = this.uiAceDataTransformPipe.parseForUIAce(payloadData);
    return formatResult;
  }
}