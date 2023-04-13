//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress', '_point', '_time'], { unique: true })
export class GetSpawnLimit {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('integer')
    _point!: number;

  @Column('numeric', { transformer: bigintTransformer })
    _time!: bigint;

  @Column('integer')
    value!: number;

  @Column('text', { nullable: true })
    proof!: string;
}
