//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress', '_whose', '_protocol', '_claim'], { unique: true })
export class FindClaim {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('numeric', { transformer: bigintTransformer })
    _whose!: bigint;

  @Column('varchar')
    _protocol!: string;

  @Column('varchar')
    _claim!: string;

  @Column('integer')
    value!: number;

  @Column('text', { nullable: true })
    proof!: string;
}
