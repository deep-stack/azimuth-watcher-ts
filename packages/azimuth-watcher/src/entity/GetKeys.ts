//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress', '_point'], { unique: true })
export class GetKeys {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('numeric', { transformer: bigintTransformer })
    _point!: bigint;

  @Column('varchar')
    value0!: string;

  @Column('varchar')
    value1!: string;

  @Column('numeric', { transformer: bigintTransformer })
    value2!: bigint;

  @Column('numeric', { transformer: bigintTransformer })
    value3!: bigint;

  @Column('text', { nullable: true })
    proof!: string;
}
