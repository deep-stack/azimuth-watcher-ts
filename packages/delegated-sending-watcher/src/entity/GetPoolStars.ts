//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockHash', 'contractAddress', '_who'], { unique: true })
export class GetPoolStars {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { length: 42 })
    contractAddress!: string;

  @Column('numeric', { transformer: bigintTransformer })
    _who!: bigint;

  @Column('integer', { array: true })
    value!: number[];

  @Column('text', { nullable: true })
    proof!: string;
}
